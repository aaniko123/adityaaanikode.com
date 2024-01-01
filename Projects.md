---
layout: page
title: Projects!
---

<p class="message">
  Welcome! Here are some of my personal projects, research I have done on certain topics, and details about my experiences.
</p>

**Design, Manufacturing, and Fabrication of a Bipedal Robot**

This is a general overview on robots and how to build and configure a bipedal robot.

Some key considerations:

1. Motor Selection and Limitations
2. Design of Foot Shape
3. System Identification
  a. Center of Mass and Inertia Matrices
4. Programming and Control



**Building a Hobby Rocket:**

This is a general tutorial on how to build your own rocket. Note that this tutorial serves as a basic guide to designigng and fabricating your rocket, however many nuances reside, such as the altitude you wish to attain, what motor you want to use, if a payload is needed, and which sensor modules you want to implement (ALTIMETER and GPS are most likely necessary to be implemented).

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
- Digi-key Transciever
- Pi-cam v2 (mid flight capture)

The multiple sensor readings were then unified into one cohesive and integrated python GUI which would be observed from the ground station throughout the duration of the launch.


**Building a Drone:**

For my undergraduate senior design project, I had been tasked with building a drone that could perform what is known as a "Zero-gravity maneuver". By quickly transitioning from a period of upward acceleration to freefall, a sensation of weightlessness is experienced by the system. A general overview of the project can be seen below in the poster.

![](https://cdn.discordapp.com/attachments/690386859330764851/1009305007490859108/unknown.png "Zero Gravity Drone Poster")

Although the motive of this project involved intensive controls tuning due to the maneuver being performed autonomously, the general steps for building a drone are fairly straightforward.

*Software used:* 

- eCalc Electric Drive simulator (Used to determine which motors and battery are required based on the weight of the drone and functionality conditions affecting the thrust-weight ratio)
- SOLIDWORKS and SOLIDWORKS Simulator
- MATLAB (for force equations invoked as the controls algorithms)
- BETAFLIGHT (**Note: see what softwares are supported by your drone's flight controller**)




