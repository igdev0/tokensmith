<div>
    <img src="public/logo.svg" width="420" style="margin-top: 40px">
</div>

## Overview

This dApp allows you authenticate with your solana wallet and fill up a form in browser to create a solana token with
metadata using spl-2022.

### Features

**Wallet Auth**: User can authenticate using a Solana wallet e.g: Phantom.<br/>
**Token metadata creation:** User can easily create token metadata, by filling the form, this data will be processed on
the backend and uploaded to the [pinata cloud](https://pinata.cloud).<br/>
**Token freeze authority:** User can enable the token freeze authority, it will always be the account signed in <br/>
**Token revoke authority:** User can enable the revoke the mint authority, which will disable the authority (current
account signed in) from minting new tokens. <br/>

## Setting up

1. Clone this repo
2. `npm install`
3. `cp .env.example .env` // setup the environment variables
4. Go to [pinata](https://pinata.cloud/) and create account & generate a API key + secret, then copy them in `.env`
   file
5. `npm run dev`

Made with ❤️, <br/> By Dorultan Ianos