import { logger } from './logger';

export const handleTransaction = async (
  contractName,
  methodName,
  transactionPromise,
  toast,
  pendingMessage = 'Transaction Pending',
  successMessage = 'Transaction Successful',
  errorMessage = 'Transaction Failed'
) => {
  if (!toast || typeof toast.closeAll !== 'function' || typeof toast !== 'function') {
    console.error('Invalid toast object provided to handleTransaction');
    return;
  }

  try {
    logger.contract.call(contractName, methodName);
    
    const tx = await transactionPromise;
    logger.contract.transaction.sent(contractName, methodName, tx.hash);
    
    toast({
      title: pendingMessage,
      description: `Transaction Hash: ${tx.hash}`,
      status: 'info',
      duration: null,
      isClosable: true,
    });

    const receipt = await tx.wait();
    logger.contract.transaction.confirmed(contractName, methodName, tx.hash, receipt);
    
    toast.closeAll();
    toast({
      title: successMessage,
      description: `Transaction confirmed in block ${receipt.blockNumber}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    return receipt;
  } catch (error) {
    logger.contract.transaction.failed(contractName, methodName, error?.transactionHash, error);
    
    if (toast && typeof toast.closeAll === 'function') {
      toast.closeAll();
    }

    if (toast && typeof toast === 'function') {
      toast({
        title: errorMessage,
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    throw error;
  }
};
