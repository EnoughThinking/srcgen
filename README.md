srcgen
=========

[![Build Status](https://travis-ci.org/EndyKaufman/srcgen.svg?branch=master)](https://travis-ci.org/EndyKaufman/srcgen)

Generate any source for any language and any frameworks from templates with Node JS

Make you custom templates, for scaffolding and fast build basic modules for you application

## Examples

    Coming soong...

## Installation CLI

    $ npm install srcgen -g

## Tests

    $ npm test

## Usage

    $ cd project_folder
    $ srcgen    

## Release History 
* 0.2.11
    * Change command line commands
    ```
    $ srcgen --help
    >
    >  Usage: srcgen [options]
    >  Options:
    >      -h, --help                     output usage information
    >      -V, --version                  output the version number
    >      -l, --show-templates           Show exists templates
    >      -t, --build-template [value]   Build from template
    >      -f, --input-file [value]       File name with input data
    >      -d, --dest-path [value]        Destination path
    >      -x, --ignore-confirm           Hide confirm for run template
    >      -s, --save-input-file [value]  Path to save all answers for reuse it
    ```
* 0.2.10
    * Fix error load input data from file with command line
* 0.2.3 - 0.2.9
    * Fix correct save input data
    * Fix error in check command arguments
    * Fix circular error
    * Fix error if inputDataFile = ''
* 0.2.2
    * Add functionalities for fast run generate template from command line, for view it run
    ```
    $ srcgen --help
    >
    >  Usage: srcgen [options]
    >  Options:
    >      -h, --help                          output usage information
    >      -V, --version                       output the version number
    >      -s, --show-templates                Show exists templates
    >      -t, --build-template [value]        Build from template
    >      -f, --input-data-file [value]       File name with input data
    >      -i, --input-data [value]            Input data
    >      -d, --dest-path [value]             Destination path
    >      -ic, --ignore-confirm               Hide confirm for run template
    >      -s, --save-input-data-path [value]  Path to save all answers for reuse it
    ```
* 0.2.1
    * Include node libs console to all javascript extracted from templates and "#.js" files
* 0.2.0
    * Change method for run script with ext "#.js"
    * Remove from all dynamic javascript extracted from templates and "#.js" files
* 0.1.5
    * Add support show version info, sample
    ```
    $ srcgen -V
    > 0.1.5
    ```
* 0.1.4 
    * Change run javascript code for prompt attributes
    * Include node libs inquirer, path, utils, objectPath when run javascript for prompt attributes
* 0.1.3 
    * Fix error when templates not found
* 0.1.2 
    * Add cli mode support
* 0.1.0 
    * Initial release