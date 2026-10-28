---
layout: page
title: Things I’ve built
eyebrow: Engineering & experimentation
description: From an idea on paper to something out in the world.
---

<nav class="project-index" aria-label="Project index"><a href="#bipedal-robot">01 Robotics ↓</a><a href="#hobby-rocket">02 Rocketry ↓</a><a href="#zero-gravity-drone">03 Drones ↓</a></nav>

<h2 id="bipedal-robot">01 / Bipedal robotics</h2>

This is a general overview on robots and how to build and configure a bipedal robot.

Some key considerations:

1. Motor Selection and Limitations
2. Design of Foot Shape
3. System Identification
  a. Center of Mass and Inertia Matrices
4. Programming and Control



<h2 id="hobby-rocket">02 / Building a hobby rocket</h2>

This is a general tutorial on how to build your own rocket. Note that this tutorial serves as a basic guide to designing and fabricating your rocket, however many nuances reside, such as the altitude you wish to attain, what motor you want to use, if a payload is needed, and which sensor modules you want to implement (ALTIMETER and GPS are most likely necessary to be implemented).

![](https://cdn.discordapp.com/attachments/690386859330764851/993361846461542490/unknown.png "Spaceport America Rocket Poster")

*Software used:*

- SOLIDWORKS or any CAD modeling software
- OPENROCKET for simulating rocket's center of pressure, center of gravity, and finding the thrust curve
- ANSYS for Fluid Flow CFD Analysis

*Telemetry Suite:*

The telemetry suite consists of an SRAD system for collecting and transmitting data and video to the ground. A Raspberry Pi 4 is implemented as the microcontroller. Redundancy is provided on GPS and altimeters

Sensors used:

- Raspberry Pi 4 for data and video logging and transmission
- ESP32 to control pressure, temperature, acceleration, and GPS sensors
- Digi-key Transceiver
- Pi-cam v2 (mid flight capture)

The multiple sensor readings were then unified into one cohesive and integrated Python GUI which would be observed from the ground station throughout the duration of the launch.


<h2 id="zero-gravity-drone">03 / A zero-gravity drone</h2>

For my undergraduate senior design project, I had been tasked with building a drone that could perform what is known as a "Zero-gravity maneuver". By quickly transitioning from a period of upward acceleration to freefall, a sensation of weightlessness is experienced by the system. A general overview of the project can be seen below in the poster.

![](https://cdn.discordapp.com/attachments/690386859330764851/1009305007490859108/unknown.png "Zero Gravity Drone Poster")

Although the motive of this project involved intensive controls tuning due to the maneuver being performed autonomously, the general steps for building a drone are fairly straightforward.

*Software used:* 

- eCalc Electric Drive simulator (Used to determine which motors and battery are required based on the weight of the drone and functionality conditions affecting the thrust-weight ratio)
- SOLIDWORKS and SOLIDWORKS Simulator
- MATLAB (for force equations invoked as the controls algorithms)
- BETAFLIGHT (**Note: see what softwares are supported by your drone's flight controller**)




