/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject } from 'n8n-workflow';
import { GalileoClient, GalileoResponse } from './galileoClient';
import { ENDPOINTS } from '../constants/endpoints';
import { generateTestCardNumber } from '../utils/cardUtils';

/**
 * Sandbox Client
 *
 * Extended client for sandbox-specific operations including
 * transaction simulation and time manipulation.
 */

export interface SimulateAuthorizationParams {
  accountNo: string;
  amount: number;
  merchantName?: string;
  merchantMcc?: string;
  merchantCity?: string;
  merchantState?: string;
  merchantCountry?: string;
  isInternational?: boolean;
  isCardPresent?: boolean;
}

export interface SimulateSettlementParams {
  authId: string;
  amount?: number; // Optional different settlement amount
}

export interface SimulateAchParams {
  accountNo: string;
  amount: number;
  type: 'credit' | 'debit';
  routingNumber?: string;
  accountNumber?: string;
  companyName?: string;
}

export interface SimulateLoadParams {
  accountNo: string;
  amount: number;
  loadType?: string;
}

export interface SimulateTransactionParams {
  accountNo: string;
  transactionType: string;
  amount: number;
  description?: string;
}

export interface AdvanceTimeParams {
  days?: number;
  hours?: number;
  minutes?: number;
}

export class SandboxClient {
  private client: GalileoClient;

  constructor(client: GalileoClient) {
    this.client = client;
  }

  /**
   * Simulates a card authorization
   */
  async simulateAuthorization(
    params: SimulateAuthorizationParams,
  ): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      accountNo: params.accountNo,
      amount: params.amount.toFixed(2),
      merchantName: params.merchantName || 'Test Merchant',
      mcc: params.merchantMcc || '5411', // Grocery stores
      merchantCity: params.merchantCity || 'San Francisco',
      merchantState: params.merchantState || 'CA',
      merchantCountry: params.merchantCountry || 'USA',
      international: params.isInternational ? '1' : '0',
      cardPresent: params.isCardPresent !== false ? '1' : '0',
    };

    return this.client.request(ENDPOINTS.sandbox.simulateAuthorization, requestParams);
  }

  /**
   * Simulates settlement of an authorization
   */
  async simulateSettlement(
    params: SimulateSettlementParams,
  ): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      authId: params.authId,
    };

    if (params.amount !== undefined) {
      requestParams.amount = params.amount.toFixed(2);
    }

    return this.client.request(ENDPOINTS.sandbox.simulateSettlement, requestParams);
  }

  /**
   * Simulates an ACH transfer
   */
  async simulateAch(params: SimulateAchParams): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      accountNo: params.accountNo,
      amount: params.amount.toFixed(2),
      type: params.type,
      routingNumber: params.routingNumber || '021000021', // Test routing number
      extAccountNo: params.accountNumber || '123456789',
      companyName: params.companyName || 'Test Company',
    };

    return this.client.request(ENDPOINTS.sandbox.simulateAch, requestParams);
  }

  /**
   * Simulates a fund load
   */
  async simulateLoad(params: SimulateLoadParams): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      accountNo: params.accountNo,
      amount: params.amount.toFixed(2),
      loadType: params.loadType || 'CASH',
    };

    return this.client.request(ENDPOINTS.sandbox.simulateLoad, requestParams);
  }

  /**
   * Simulates a generic transaction
   */
  async simulateTransaction(
    params: SimulateTransactionParams,
  ): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      accountNo: params.accountNo,
      transactionType: params.transactionType,
      amount: params.amount.toFixed(2),
      description: params.description || 'Simulated transaction',
    };

    return this.client.request(ENDPOINTS.sandbox.simulateTransaction, requestParams);
  }

  /**
   * Advances sandbox time for testing time-based features
   */
  async advanceTime(params: AdvanceTimeParams): Promise<GalileoResponse<IDataObject>> {
    let totalMinutes = 0;
    if (params.days) totalMinutes += params.days * 24 * 60;
    if (params.hours) totalMinutes += params.hours * 60;
    if (params.minutes) totalMinutes += params.minutes;

    return this.client.request(ENDPOINTS.sandbox.advanceTime, {
      minutes: totalMinutes,
    });
  }

  /**
   * Resets a sandbox account to initial state
   */
  async resetAccount(accountNo: string): Promise<GalileoResponse<IDataObject>> {
    return this.client.request(ENDPOINTS.sandbox.resetAccount, {
      accountNo,
    });
  }

  /**
   * Generates test card data for sandbox testing
   */
  generateTestCardData(): {
    cardNumber: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
  } {
    const cardNumber = generateTestCardNumber('4111111111');
    const now = new Date();
    const futureYear = now.getFullYear() + 3;

    return {
      cardNumber,
      expirationMonth: '12',
      expirationYear: futureYear.toString().slice(-2),
      cvv: '123',
    };
  }

  /**
   * Creates a test transaction sequence
   * (auth -> settlement)
   */
  async createTestTransactionSequence(
    accountNo: string,
    amount: number,
  ): Promise<{
    authorization: GalileoResponse<IDataObject>;
    settlement: GalileoResponse<IDataObject>;
  }> {
    // Step 1: Create authorization
    const authResponse = await this.simulateAuthorization({
      accountNo,
      amount,
      merchantName: 'Test Sequence Merchant',
    });

    if (authResponse.status !== 0) {
      throw new Error(`Authorization failed: ${authResponse.statusMessage}`);
    }

    // Extract auth ID from response
    const authId = (authResponse.data?.auth_id || authResponse.data?.authId) as string;
    if (!authId) {
      throw new Error('No authorization ID returned');
    }

    // Step 2: Settle the authorization
    const settlementResponse = await this.simulateSettlement({ authId });

    return {
      authorization: authResponse,
      settlement: settlementResponse,
    };
  }

  /**
   * Simulates a declined authorization
   */
  async simulateDeclinedAuth(
    accountNo: string,
    reason: 'insufficient_funds' | 'card_blocked' | 'velocity_exceeded' | 'fraud',
  ): Promise<GalileoResponse<IDataObject>> {
    const requestParams: Record<string, unknown> = {
      accountNo,
      amount: '1000000.00', // Large amount likely to trigger decline
      simulateDecline: reason,
    };

    return this.client.request(ENDPOINTS.sandbox.simulateAuthorization, requestParams);
  }

  /**
   * Simulates an ACH return
   */
  async simulateAchReturn(achId: string, returnCode: string): Promise<GalileoResponse<IDataObject>> {
    return this.client.request(ENDPOINTS.sandbox.simulateAch, {
      achId,
      simulateReturn: '1',
      returnCode: returnCode || 'R01', // Insufficient funds
    });
  }
}

/**
 * Creates a sandbox client from a regular Galileo client
 */
export function createSandboxClient(client: GalileoClient): SandboxClient {
  return new SandboxClient(client);
}
