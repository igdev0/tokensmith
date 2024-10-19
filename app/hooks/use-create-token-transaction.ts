import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE
} from '@solana/spl-token';
import {createInitializeInstruction, pack, TokenMetadata} from '@solana/spl-token-metadata';
import {INITIAL_DATA} from '@/app/components/create-token';

export default function useCreateTokenTransaction() {
  return async (connection: Connection, mint: Keypair, formData: typeof INITIAL_DATA, payer: PublicKey, hasTokenFreeze = false) => {
    const recentBlockhash = await connection.getLatestBlockhash();
    const freezeAuthority = hasTokenFreeze ? payer : null;
    const transaction = new Transaction({recentBlockhash: recentBlockhash.blockhash, feePayer: payer});
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const metadata: TokenMetadata = {
      mint: mint.publicKey,
      name: formData.name,
      symbol: formData.symbol,
      uri: formData.metadata_uri,
      additionalMetadata: [],
    };

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const accountCreationInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      lamports: mintLamports,
      space: mintLen,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const metadataPointerInstruction = createInitializeMetadataPointerInstruction(mint.publicKey, payer, mint.publicKey, TOKEN_2022_PROGRAM_ID);

    const createMintInstruction = createInitializeMintInstruction(
        mint.publicKey,
        formData.decimals as number,
        payer,
        freezeAuthority,
        TOKEN_2022_PROGRAM_ID
    );

    const associatedTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        payer,
        false,
        TOKEN_2022_PROGRAM_ID
    );
    const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
    );

    const mintTotalSupplyInstruction = createMintToInstruction(mint.publicKey, associatedTokenAccount, payer, formData.total_supply * Math.pow(10, formData.decimals), [], TOKEN_2022_PROGRAM_ID);

    const metadataInstruction = createInitializeInstruction({
      name: formData.name,
      symbol: formData.symbol,
      mint: mint.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
      uri: metadata.uri,
      updateAuthority: payer,
      metadata: mint.publicKey,
      mintAuthority: payer,
    });

    transaction.add(accountCreationInstruction, metadataPointerInstruction, createMintInstruction, metadataInstruction, createTokenAccountInstruction, mintTotalSupplyInstruction);

    if (formData.revoke_authority) {
      const revokeAuthorityInstruction = createSetAuthorityInstruction(mint.publicKey, payer, AuthorityType.MintTokens, null, [], TOKEN_2022_PROGRAM_ID);
      transaction.add(revokeAuthorityInstruction);
    }

    return transaction;
  };
}