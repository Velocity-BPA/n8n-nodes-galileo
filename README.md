# n8n-nodes-galileo

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **Galileo Financial Technologies** BaaS platform, providing 24 resources and 200+ operations for card issuing, account management, ACH transfers, digital wallets, and complete banking-as-a-service functionality.

![n8n](https://img.shields.io/badge/n8n-community--node-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Features

- **Complete Account Management** - Create, manage, freeze, and close accounts
- **Card Issuing** - Full card lifecycle management including virtual and physical cards
- **Transaction Processing** - Authorizations, settlements, adjustments, and reversals
- **ACH Transfers** - Send and receive ACH credits and debits
- **Direct Deposit** - Manage direct deposit setup and routing
- **Bill Pay** - Create and manage bill payments
- **Digital Wallets** - Apple Pay, Google Pay, and Samsung Pay provisioning
- **KYC Verification** - Identity verification and document management
- **Fraud Prevention** - Fraud scoring, alerts, and velocity controls
- **Disputes** - Full dispute lifecycle management
- **Rewards** - Points balance, redemption, and transfers
- **Webhook Triggers** - Real-time event notifications for 30+ event types
- **Sandbox Testing** - Simulate transactions, ACH, and time advancement

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-galileo`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the node
npm install n8n-nodes-galileo

# Restart n8n
n8n start
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-galileo.git
cd n8n-nodes-galileo

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-galileo

# Restart n8n
n8n start
```

## Credentials Setup

### Galileo API Credentials

| Field | Description |
|-------|-------------|
| Environment | Select Production, Sandbox, or Custom |
| Provider ID | Your Galileo Provider ID |
| API Login | Your Galileo API Login |
| API Trans Key | Your Galileo API Transaction Key |
| Product ID | Optional: Default product ID |
| Webhook Secret | Optional: Secret for webhook signature verification |

### Getting Credentials

1. Sign up for a Galileo sandbox account at [galileo-ft.com](https://www.galileo-ft.com/)
2. Access the Galileo Developer Portal
3. Navigate to API Credentials section
4. Generate your API Login and Trans Key
5. Note your Provider ID and Product ID(s)

## Resources & Operations

### Account Resource (14 operations)
Create, Get, Get Balance, Get Status, Update Status, Freeze, Unfreeze, Close, Get History, Get Transactions, Get Limits, Update Limits, Get by External ID, List

### Card Resource (18 operations)
Create, Get, Get Details, Activate, Freeze, Unfreeze, Replace, Reissue, Close, Get Status, Update Status, Get PIN, Set PIN, Reset PIN, Get CVV2, Get Expiration, List by Account, Update Limits

### Cardholder Resource (10 operations)
Create, Get, Update, Get by SSN, Get by External ID, Update Address, Update Phone, Update Email, Get Status, Update Status

### Transaction Resource (11 operations)
Get, List, Get by Account, Get by Card, Get by Date, Get Pending, Get Posted, Search, Get Details, Adjust, Reverse

### Authorization Resource (8 operations)
Get, List, Get Pending, Simulate, Approve, Decline, Get by Merchant, Get Auth Controls

### Payment Resource (8 operations)
Create ACH Transfer, Create Instant Transfer, Create Card-to-Card, Get, Get Status, Cancel, Get by Account, Get History

### Load Resource (6 operations)
Load Funds, Load Funds Immediate, Get Status, Get History, Get by Reference, Cancel

### Withdrawal Resource (6 operations)
Create, Get, Get Status, Cancel, Get by Account, Get ATM

### ACH Resource (8 operations)
Create Credit, Create Debit, Get Transfer, Get Status, Cancel, Get by Reference, Get Returns, Get Limits

### Direct Deposit Resource (5 operations)
Get Info, Update, Get Instructions, Get Routing Number, Get Account Number

### Bill Pay Resource (8 operations)
Create Payment, Get Payment, Cancel Payment, Get Payments, Get Billers, Add Biller, Remove Biller, Get Payment Status

### Dispute Resource (8 operations)
Create, Get, Get Status, Update, Get by Account, Get by Card, Upload Document, Get Deadline

### Fraud Resource (8 operations)
Get Fraud Score, Report Fraud, Get Alerts, Update Status, Get Rules, Block Transaction Type, Unblock Transaction Type, Get Velocity Limits

### Fee Resource (7 operations)
Get Schedule, Apply Fee, Waive Fee, Get by Account, Get History, Get Types, Calculate Fee

### Limit Resource (8 operations)
Get Account Limits, Update Account Limits, Get Card Limits, Update Card Limits, Get Transaction Limits, Get Daily Limits, Get Monthly Limits, Reset Limits

### Statement Resource (5 operations)
Get, List, Get PDF, Get by Period, Get Mini

### Notification Resource (7 operations)
Get Settings, Update Settings, Get Notifications, Mark Read, Get Channels, Subscribe, Unsubscribe

### KYC Resource (7 operations)
Submit, Get Status, Get Result, Upload Document, Get Requirements, Retry, Get Identity Verification

### Program Resource (6 operations)
Get Info, Get Settings, Get Limits, Get Fees, Get Card Products, Get Account Products

### Digital Wallet Resource (7 operations)
Provision Apple Pay, Provision Google Pay, Provision Samsung Pay, Get Wallet Token, Get Wallet Status, Deactivate Wallet Token, Get Provisioning Data

### Rewards Resource (6 operations)
Get Balance, Get History, Redeem, Get Rules, Get Catalog, Transfer

### Webhook Resource (8 operations)
Create, Get, Update, Delete, List, Test, Get Events, Retry

### Sandbox Resource (7 operations)
Simulate Authorization, Simulate Settlement, Simulate ACH, Simulate Load, Simulate Transaction, Advance Time, Reset Account

### Utility Resource (7 operations)
Get BIN Info, Validate Card Number, Get MCC Codes, Get Country Codes, Get Currency Codes, Test Connection, Get API Status

## Trigger Node

The **Galileo Trigger** node allows you to start workflows when Galileo events occur.

### Supported Events

**Account Events**: Account Created, Updated, Frozen, Unfrozen, Closed, Balance Changed, Limit Changed

**Card Events**: Card Created, Activated, Frozen, Unfrozen, Replaced, Closed, PIN Changed, Shipped

**Transaction Events**: Authorization Created, Authorization Declined, Transaction Posted, Reversed, Adjusted, Large Transaction Alert

**Payment Events**: ACH Initiated, Completed, Returned, Load Completed, Withdrawal Completed, Transfer Completed

**Fraud Events**: Fraud Alert, Velocity Exceeded, Suspicious Activity, Card Blocked

**Dispute Events**: Dispute Created, Updated, Resolved, Chargeback Received

**Digital Wallet Events**: Wallet Provisioned, Activated, Deactivated

**KYC Events**: KYC Submitted, Approved, Rejected, Document Required

## Usage Examples

### Create an Account and Issue a Card

```javascript
// 1. Create Account node
Resource: Account
Operation: Create
First Name: John
Last Name: Doe
Date of Birth: 1990-01-15
SSN: 123-45-6789
// Address fields...

// 2. Create Card node (connected after)
Resource: Card
Operation: Create
PRN: {{ $json.prn }}
Card Type: Virtual

// 3. Activate Card node
Resource: Card
Operation: Activate
PRN: {{ $json.prn }}
```

### Process ACH Direct Deposit

```javascript
// Trigger: Galileo Trigger
Events: ACH Completed

// Check if direct deposit
IF node:
Value 1: {{ $json.data.source }}
Operation: Equals
Value 2: payroll

// Notify user
Send Email:
To: {{ $json.data.email }}
Subject: Direct Deposit Received
Body: Your payroll of ${{ $json.data.amount }} has been deposited.
```

### Fraud Alert Handling

```javascript
// Trigger: Galileo Trigger
Events: Fraud Alert, Suspicious Activity

// Freeze card immediately
Resource: Card
Operation: Freeze
PRN: {{ $json.data.prn }}

// Create support ticket
HTTP Request to your ticketing system

// Send SMS alert
Twilio: Send SMS
Message: Suspicious activity detected on your account. Card has been frozen.
```

## Galileo Concepts

| Term | Description |
|------|-------------|
| **PRN** | Program Routing Number - Unique identifier for accounts |
| **CAD** | Card Account Data - Encrypted card details |
| **PAN** | Primary Account Number - 16-digit card number |
| **CVV2** | Card Verification Value - 3-digit security code |
| **Load** | Adding funds to an account |
| **Direct Deposit** | Incoming ACH credit (payroll, benefits) |
| **Instant** | Real-time payment processing |
| **BIN** | Bank Identification Number - First 6-8 digits of card |
| **Product ID** | Identifier for card/account types |
| **Provider ID** | Partner/program identifier |
| **Settlement** | Finalizing a transaction |
| **Adjustment** | Manual balance correction |
| **Velocity** | Transaction frequency/limits |

## Networks

| Network | Supported |
|---------|-----------|
| Visa | ✅ |
| Mastercard | ✅ |

## Error Handling

The node returns detailed error information:

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Transaction declined due to insufficient funds",
    "details": {
      "available_balance": "50.00",
      "requested_amount": "100.00"
    }
  }
}
```

Common error codes:
- `INVALID_ACCOUNT` - Account not found or invalid PRN
- `CARD_FROZEN` - Card is frozen and cannot be used
- `INSUFFICIENT_FUNDS` - Not enough balance
- `VELOCITY_EXCEEDED` - Transaction limits exceeded
- `KYC_REQUIRED` - KYC verification needed
- `INVALID_AUTH` - Authentication failed

## Security Best Practices

1. **Never log sensitive data** - Card numbers, PINs, SSNs
2. **Use environment-specific credentials** - Separate sandbox and production
3. **Verify webhook signatures** - Enable signature verification in triggers
4. **Implement rate limiting** - Galileo has API rate limits
5. **Audit all transactions** - Log transaction IDs for reconciliation
6. **Handle PCI data carefully** - Never store PANs or CVVs
7. **Use HTTPS only** - All API calls use TLS
8. **Rotate credentials regularly** - Update API keys periodically

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code:
- Passes linting (`npm run lint`)
- Includes tests for new features
- Follows the existing code style
- Includes appropriate documentation

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-galileo/issues)
- **Documentation**: [Galileo API Docs](https://docs.galileo-ft.com/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Galileo Financial Technologies](https://www.galileo-ft.com/) for their comprehensive BaaS platform
- [n8n](https://n8n.io/) for the workflow automation platform
- The open-source community for continuous improvement
