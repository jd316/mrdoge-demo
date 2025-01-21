import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text
} from '@chakra-ui/react';

const ConfirmationDialog = React.memo(({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent bg="#131A2A" color="white">
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>
        <Text>Are you sure?</Text>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose}>
          Cancel
        </Button>
        <Button 
          colorScheme="orange" 
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
));

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;