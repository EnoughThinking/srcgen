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
* 0.2.0
    * Change method for run script with ext "#.js"
    * Remove from all dynamic javascript extracted from templates and "#.js" files
* 0.1.5
    * Add support show version info, sample
    ```
    $srcgen -V
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