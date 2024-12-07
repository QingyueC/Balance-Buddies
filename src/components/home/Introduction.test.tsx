import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Introduction from './Introduction';

jest.mock('./Video', () => () => <div data-testid="mock-video">Mock Video</div>);

describe('Introduction Component', () => {
    it('renders the heading', () => {
        render(<Introduction />);
        const heading = screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'About Balance Buddies';
            const elementHasText = hasText(element!);
            const childrenDontHaveText = Array.from(element!.children).every(child => !hasText(child));
            return elementHasText && childrenDontHaveText;
        });
        expect(heading).toBeInTheDocument();
    });

    // Other tests can stay the same
});
