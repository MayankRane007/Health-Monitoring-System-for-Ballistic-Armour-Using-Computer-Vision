
args = split(getArgument(), "|");

if (args.length != 4) {
    exit("ERROR: Expected four arguments: input, grayscale, annotated, CSV");
}

inputPath = args[0];
grayscalePath = args[1];
annotatedPath = args[2];
csvPath = args[3];

setBatchMode(true);

print("======================================");
print("ARMOURGUARD AI - IMAGE ANALYSIS");
print("======================================");

print("STAGE 1: Opening image");

open(inputPath);

if (nImages == 0) {
    exit("ERROR: Input image could not be opened.");
}

print("STAGE 2: Grayscale preprocessing");

run("8-bit");
run("Enhance Contrast", "saturated=0.35");

saveAs("Tiff", grayscalePath);

print("Grayscale image saved: " + grayscalePath);

print("STAGE 3: Creating analysis copy");

run("Duplicate...", "title=Candidate_Analysis");

print("STAGE 4: Applying threshold");

setAutoThreshold("Default");
run("Convert to Mask");

print("STAGE 5: Detecting candidate regions");

run("Clear Results");

run(
    "Set Measurements...",
    "area perimeter shape redirect=None decimal=3"
);

run(
    "Analyze Particles...",
    "size=20-Infinity circularity=0.00-1.00 show=Outlines display clear"
);

measurementCount = nResults;

print("Candidate regions detected: " + measurementCount);

print("STAGE 6: Saving annotated image");

titles = getList("image.titles");
annotatedFound = false;

for (i = 0; i < titles.length; i++) {

    if (startsWith(titles[i], "Drawing of")) {

        selectWindow(titles[i]);

        saveAs("Tiff", annotatedPath);

        annotatedFound = true;

        print("Annotated image saved: " + annotatedPath);

        break;
    }
}

if (!annotatedFound) {
    exit("ERROR: No annotated image was generated.");
}

print("STAGE 7: Generating measurements CSV");

csvText = "Region_ID,Area_px2,Perimeter_px,Circularity,Aspect_Ratio,Roundness,Solidity\n";

for (i = 0; i < measurementCount; i++) {

    regionID = i + 1;

    areaValue = d2s(getResult("Area", i), 3);
    perimeterValue = d2s(getResult("Perim.", i), 3);
    circularityValue = d2s(getResult("Circ.", i), 3);
    aspectRatioValue = d2s(getResult("AR", i), 3);
    roundnessValue = d2s(getResult("Round", i), 3);
    solidityValue = d2s(getResult("Solidity", i), 3);

    csvText = csvText
        + regionID + ","
        + areaValue + ","
        + perimeterValue + ","
        + circularityValue + ","
        + aspectRatioValue + ","
        + roundnessValue + ","
        + solidityValue + "\n";
}

File.saveString(csvText, csvPath);

if (!File.exists(csvPath)) {
    exit("ERROR: CSV file could not be created: " + csvPath);
}

print("CSV successfully generated: " + csvPath);
print("Total measurement records: " + measurementCount);

print("STAGE 8: Cleaning up");

if (isOpen("Results")) {
    selectWindow("Results");
    run("Close");
}

close("*");

print("======================================");
print("SUCCESS: IMAGE ANALYSIS COMPLETED");
print("======================================");

setBatchMode(false);

run("Quit");
