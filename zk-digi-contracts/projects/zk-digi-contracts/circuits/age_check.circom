pragma circom 2.0.0;

include "../../../../snarkjs-algorand/circuit/node_modules/circomlib/circuits/comparators.circom";

// Proves that age >= 18 without revealing the actual age
// Private input: age
// Public input: threshold (e.g. 18)

template AgeCheck() {
    signal input age;        // private
    signal input threshold;  // public
    signal output valid;     // public

    // check age >= threshold
    component gte = GreaterEqThan(7); // supports 0-127
    gte.in[0] <== age;
    gte.in[1] <== threshold;

    valid <== gte.out;
    
    // Enforce that valid must be 1
    valid === 1;
}

component main { public [threshold] } = AgeCheck();
