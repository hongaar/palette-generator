import { CopyIcon, RepeatIcon } from '@chakra-ui/icons';
import {
    Button,
    HStack,
    useToast,
} from '@chakra-ui/react';
import React from 'react';
import { copyToClipboard } from '../utils/colorUtils';

interface ActionButtonsProps {
  onGenerateNew: () => void;
  onRandomizePalette?: () => void;
  algorithm: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onGenerateNew,
  onRandomizePalette,
  algorithm,
}) => {
  const toast = useToast();

  const shareUrl = async () => {
    const url = window.location.href;
    await copyToClipboard(url);
    toast({
      title: 'URL copied!',
      description: 'Share this URL to recreate the palette',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <HStack spacing={4} justify="center">
      <Button
        leftIcon={<RepeatIcon />}
        onClick={onGenerateNew}
        colorScheme="blue"
        size="md"
      >
        Randomize Base Colors
      </Button>
      
      {algorithm === 'auto' && onRandomizePalette && (
        <Button
          leftIcon={<RepeatIcon />}
          onClick={onRandomizePalette}
          colorScheme="purple"
          size="md"
        >
          Randomize Palette
        </Button>
      )}
      
      <Button
        leftIcon={<CopyIcon />}
        onClick={shareUrl}
        colorScheme="green"
        variant="outline"
        size="md"
      >
        Share URL
      </Button>
    </HStack>
  );
};
