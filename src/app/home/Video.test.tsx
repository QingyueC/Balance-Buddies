import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Video from '@/app/home/Video';

describe('Video Component', () => {
  it('renders the video thumbnail and play button initially', () => {
    render(<Video />);

    const thumbnail = screen.getByAltText('YouTube Thumbnail');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/KKar0Y47q_s/maxresdefault.jpg'
    );

    const playButton = screen.getByRole('button', { name: '▶' });
    expect(playButton).toBeInTheDocument();
  });

  it('renders the iframe when the thumbnail is clicked', () => {
    render(<Video />);

    const thumbnail = screen.getByAltText('YouTube Thumbnail');
    fireEvent.click(thumbnail);

    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/KKar0Y47q_s?autoplay=1'
    );
  });

  it('renders the iframe when the play button is clicked', () => {
    render(<Video />);

    const playButton = screen.getByRole('button', { name: '▶' });
    fireEvent.click(playButton);

    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/KKar0Y47q_s?autoplay=1'
    );
  });

  it('does not display the thumbnail or play button after the video starts playing', () => {
    render(<Video />);

    const playButton = screen.getByRole('button', { name: '▶' });
    fireEvent.click(playButton);

    expect(screen.queryByAltText('YouTube Thumbnail')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '▶' })).not.toBeInTheDocument();
  });
});
