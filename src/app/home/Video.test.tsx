import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Video from "./Video";

describe("Video Component", () => {
  it("renders the thumbnail image and play button initially", () => {
    render(<Video />);
    
    // Assert thumbnail image is displayed
    const thumbnail = screen.getByAltText("YouTube Thumbnail");
    expect(thumbnail).toBeInTheDocument();

    // Assert play button is displayed
    const playButton = screen.getByRole("button", { name: "▶" });
    expect(playButton).toBeInTheDocument();
  });

  it("switches to iframe when play button is clicked", () => {
    render(<Video />);

    // Click the play button
    const playButton = screen.getByRole("button", { name: "▶" });
    fireEvent.click(playButton);

    // Assert iframe is displayed
    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe).toBeInTheDocument();

    // Assert thumbnail and play button are no longer displayed
    expect(screen.queryByAltText("YouTube Thumbnail")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "▶" })).not.toBeInTheDocument();
  });

  it("renders iframe with correct YouTube video URL", () => {
    render(<Video />);

    // Click the play button
    const playButton = screen.getByRole("button", { name: "▶" });
    fireEvent.click(playButton);

    // Assert iframe src is correct
    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/KKar0Y47q_s?autoplay=1"
    );
  });
});
