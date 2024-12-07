import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExpenseDocumentsInput } from '@/components/expense-documents-input';
import { useToast } from '@/components/ui/use-toast';
import { getImageData } from 'next-s3-upload';

jest.mock('next-s3-upload', () => ({
  usePresignedUpload: jest.fn(),
  getImageData: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  randomId: jest.fn(() => 'mocked-id'),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

function createMockFile(name: string, size: number, type: string = 'image/png'): File {
  const content = new Uint8Array(size).fill(0); // Fill with `size` bytes of zero
  return new File([content], name, { type });
}

describe('ExpenseDocumentsInput', () => {
  const mockUseToast = useToast as jest.Mock;
  const mockUpdateDocuments = jest.fn();
  const mockGetImageData = getImageData as jest.Mock;

  const mockFileInput = jest.fn();
  const mockOpenFileDialog = jest.fn();
  const mockUploadToS3 = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('next-s3-upload').usePresignedUpload.mockReturnValue({
      FileInput: ({ onChange }: { onChange: (file: File) => void }) => (
        <input
          type="file"
          data-testid="file-input"
          onChange={(e) => onChange((e.target.files as FileList)[0])}
        />
      ),
      openFileDialog: mockOpenFileDialog,
      uploadToS3: mockUploadToS3,
    });
    mockUseToast.mockReturnValue({ toast: jest.fn() });
  });

  it('renders file input and add button', () => {
    render(
      <ExpenseDocumentsInput
        documents={[]}
        updateDocuments={mockUpdateDocuments}
      />
    );

    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays an error toast if upload fails', async () => {
    const validFile = createMockFile('valid-file.png', 1 * 1024 ** 2);
    mockGetImageData.mockResolvedValueOnce({ width: 100, height: 100 });
    mockUploadToS3.mockRejectedValueOnce(new Error('Upload failed'));
  
    render(
      <ExpenseDocumentsInput
        documents={[]}
        updateDocuments={mockUpdateDocuments}
      />
    );
  
    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [validFile] } });
  
    await waitFor(() => {
      expect(mockUseToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Error while uploading document'),
          description: expect.stringContaining(
            'Something wrong happened when uploading the document. Please retry later or select a different file.'
          ),
          variant: 'destructive',
          action: expect.anything(), // Matches the action in the toast
        })
      );
    });
  });
  

  it('uploads a valid file and updates documents', async () => {
    const validFile = createMockFile('valid-file.png', 1 * 1024 ** 2);
    mockGetImageData.mockResolvedValueOnce({ width: 100, height: 100 });
    mockUploadToS3.mockResolvedValueOnce({ url: 'https://example.com/image.png' });

    render(
      <ExpenseDocumentsInput
        documents={[]}
        updateDocuments={mockUpdateDocuments}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(mockGetImageData).toHaveBeenCalledWith(validFile);
      expect(mockUploadToS3).toHaveBeenCalledWith(validFile);
      expect(mockUpdateDocuments).toHaveBeenCalledWith([
        {
          id: 'mocked-id',
          url: 'https://example.com/image.png',
          width: 100,
          height: 100,
        },
      ]);
    });
  });

  it('displays an error toast if upload fails', async () => {
    const validFile = createMockFile('valid-file.png', 1 * 1024 ** 2);
    mockGetImageData.mockResolvedValueOnce({ width: 100, height: 100 });
    mockUploadToS3.mockRejectedValueOnce(new Error('Upload failed'));
  
    render(
      <ExpenseDocumentsInput
        documents={[]}
        updateDocuments={mockUpdateDocuments}
      />
    );
  
    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [validFile] } });
  
    await waitFor(() => {
      expect(mockUseToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Error while uploading document'),
          description: expect.stringContaining(
            'Something wrong happened when uploading the document. Please retry later or select a different file.'
          ),
          variant: 'destructive',
          action: expect.anything(), // Matches the action in the toast
        })
      );
    });
  });

});
