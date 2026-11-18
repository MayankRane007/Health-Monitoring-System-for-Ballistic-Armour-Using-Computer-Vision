
args = split(getArgument(), "|");

if (args.length != 2) {
    exit("Error: Input and output paths are required.");
}

inputPath = args[0];
outputPath = args[1];

// Open original image
open(inputPath);

// Convert image to 8-bit grayscale
run("8-bit");

// Save processed image as TIFF
saveAs("Tiff", outputPath);

// Close the image
close();

print("Grayscale conversion completed successfully.");

// Exit Fiji after processing
run("Quit");