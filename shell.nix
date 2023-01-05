with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        nodejs-18_x
        yarn
        bash
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        . ~/.bashrc
    '';
}
