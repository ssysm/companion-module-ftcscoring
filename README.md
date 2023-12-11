# Companion Module for FTC - Scoring API Connector

## Overview

This module connects to the FTC Scoring API and provides the field data to Companion and let you control other
A/V equipment based on the field state.
It is designed to be used with the [FTC Scoring System](https://github.com/FIRST-Tech-Challenge/scorekeeper)
for traditional in person events (with local server tested, cloud to be tested).

## Configuration

Since this module is under heavy development, it is not submitted to the Companion repo yet.

1. Turn on dev mode in Companion

1. Clone this repo and install node, then run `yarn install` to install dependencies.

1. Search for the module in Companion and add it.

1. Configure the module with the IP address of the scoring system, the qualifier event id.

## Roadmap

The following features are planned:

[] Add support for end match event emitter, using local timer per [FIRST suggestion](https://github.com/FIRST-Tech-Challenge/scorekeeper/issues/669)

[] Testing with cloud scoring system

[] More testing with local events
