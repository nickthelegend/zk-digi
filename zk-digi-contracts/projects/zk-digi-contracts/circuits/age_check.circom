pragma circom 2.0.0;

// Include circomlib circuits for comparators
include "../../../../snarkjs-algorand/circuit/node_modules/circomlib/circuits/comparators.circom";

/**
 * age_check.circom - Age Verification Circuit
 * 
 * Proves that the holder is over a minimum age without revealing their exact age.
 * 
 * Circuit Details:
 * - Private Inputs: birthYear, birthMonth, birthDay
 * - Public Inputs: minAge, currentYear, currentMonth, currentDay
 * - Output: valid (1 if age >= minAge)
 * 
 * Security: ~100 R1CS constraints
 * Curve: alt_bn128 (BN254) - for compatibility with current snarkjs setup
 * 
 * TO USE:
 * 1. Compile: circom age_check.circom --wasm -o circuits/
 * 2. Trusted Setup: snarkjs groth16 setup age_check.r1cs pot12_final.ptau age_check_0000.zkey
 * 3. Prove: snarkjs groth16 fullProve input.json age_check_js/age_check.wasm age_check_final.zkey proof.json public.json
 */

template AgeCheck() {
    // Private inputs (known only to prover)
    signal input birthYear;
    signal input birthMonth; 
    signal input birthDay;
    
    // Public inputs (visible to verifier)
    signal input minAge;
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    
    signal output valid;  // 1 if age >= minAge, 0 otherwise

    // Calculate age based on year difference
    signal yearDiff;
    yearDiff <== currentYear - birthYear;

    // Adjust for month/day
    // If currentDate < birthDate, subtract 1 from age
    signal birthMonthAdjusted;
    signal birthDayAdjusted;
    
    component monthCheck = GreaterThan(8);
    monthCheck.in[0] <== currentMonth;
    monthCheck.in[1] <== birthMonth;
    birthMonthAdjusted <== monthCheck.out;

    component dayCheck = GreaterThan(8);
    dayCheck.in[0] <== currentDay;
    dayCheck.in[1] <== birthDay;
    birthDayAdjusted <== dayCheck.out;

    // Final age calculation
    signal age;
    age <== yearDiff - (1 - birthMonthAdjusted) - (1 - birthDayAdjusted);

    // Check minimum age
    component gte = GreaterEqThan(32);
    gte.in[0] <== age;
    gte.in[1] <== minAge;

    valid <== gte.out;
    
    // Enforce valid = 1 (must pass the check)
    valid === 1;
}

// Public inputs: [minAge, currentYear, currentMonth, currentDay]
component main { public [minAge, currentYear, currentMonth, currentDay] } = AgeCheck();