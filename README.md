# Surfboard Payments - Next.js Sample Application

This is a sample application demonstrating the integration of the [Surfboard Payments Online SDK](https://developers.surfboardpayments.com/guides/online-payments/online-payment-terminals/online-sdk-guide) into a [Next.js](https://nextjs.org) project. It provides a functional payment terminal UI that supports various payment methods and allows for updating customer details.

## Features

-   **Dynamic SDK Loading**: The Surfboard Payments SDK is loaded dynamically from the URL specified in the environment variables.
-   **Payment Form**: A complete payment form with support for Card, Apple Pay, and Google Pay.
-   **Customer Details**: A collapsible form to update customer information (email, phone, billing address).
-   **Real-time Logging**: A dedicated section to display logs from the SDK and application events.

## Prerequisites

Before you begin, ensure you have met the following requirements.

### Account Requirements
-   A developer account with [Surfboard Payments](https://developers.surfboardpayments.com/).

### Technical Requirements
-   [Node.js](https://nodejs.org/en/) (v18.x or later)
-   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

## Getting Started

Follow these steps to get the application up and running on your local machine.

### 1. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

This project requires a public key and an SDK URL from Surfboard Payments. Create a file named `.env.local` in the root of the project and add the following variables:

```
NEXT_PUBLIC_SURFBOARD_SDK_URL=<YOUR_SDK_URL>
NEXT_PUBLIC_SURFBOARD_TERMINAL_PUBLIC_KEY=<YOUR_TERMINAL_PUBLIC_KEY>
```

-   `NEXT_PUBLIC_SURFBOARD_SDK_URL`: The URL for the Surfboard Payments SDK.
-   `NEXT_PUBLIC_SURFBOARD_TERMINAL_PUBLIC_KEY`: The terminal public key. This can be fetched from your terminal's information after registering a terminal.

For more details, please visit the [Surfboard Payments Developer Portal](https://developers.surfboardpayments.com/).

### 3. Configure Test Credentials

The `orderId` and `nonce` are required to initialize the SDK. These values are returned in the response of the `create order` endpoint from the Surfboard Payments API.

For testing purposes, these values are hardcoded in `app/components/PaymentForm.tsx`. Open this file and replace the placeholder values with a valid `orderId` and `nonce` from your backend.

```typescript
// app/components/PaymentForm.tsx

const orderId = 'REPLACE_WITH_YOUR_ORDER_ID';
const nonce = 'REPLACE_WITH_YOUR_NONCE';
```

### 4. Run the Application

Once the dependencies are installed and the environment variables are set, you can run the development server:

```bash
npm run dev
```

By default, the application will be available at [http://localhost:3000](http://localhost:3000). You can also run it on a specific port, such as port 80, with the following command:

```bash
npm run dev -- -p 80
```

Open the URL in your browser to see the payment form in action.
