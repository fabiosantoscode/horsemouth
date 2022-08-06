with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        nodejs-16_x
        yarn
        bash
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        . ~/.bashrc
    '';
}
