template DocumentVerifier() {
    signal input hash;
    signal input docByte0;
    signal input docByte1;
    signal input docByte2;
    signal input docByte3;
    
    signal temp;
    temp <== docByte0 + docByte1 + docByte2 + docByte3;
    
    signal hashOut;
    hashOut <== temp * 1000000;
    
    hash === hashOut;
}

component main = DocumentVerifier();