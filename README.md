# End of the Year Project 4EINF - Palo

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/palo-landrae/cycle-path-finder">
    <img src="https://github.com/palo-landrae/cycle-path-finder/blob/master/backend/static/assets/bike.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Cycle Path Finder</h3>

  <p align="center">
    Find possible cycle paths on the way from A to B on a Leaflet map.
    <br />
    <a href="https://github.com/palo-landrae/cycle-path-finder"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/palo-landrae/cycle-path-finder">View Demo</a>
    ·
    <a href="https://github.com/palo-landrae/cycle-path-finder/issues">Report Bug</a>
    ·
    <a href="https://github.com/palo-landrae/cycle-path-finder/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#installation">Installation</a></li></li>
    <li><a href="#contacts">Contacts</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project
<p align="center">
 <img src="https://github.com/palo-landrae/cycle-path-finder/blob/master/backend/static/assets/project_screenshot.png" alt="Project screenshot" width="800" height="600">
</p>

##### Disclaimer: I do not own any of the images used in this project. This project is only for educational purposes. All rights belong to the owner.

After many hours of reading API documentations, searching for solutions on stackoverflow, and trial and error. I finally made a "decent" web app, this web application shows you all the possible cycle paths on the way from a starting location to a destination <strong>in Milan</strong>.

### Built With
List of add-ons/plugins used to build the project:

#### JavaScript
* [Leaflet](https://leafletjs.com/) - an open-source JavaScript library for mobile-friendly interactive maps.
* [Leaflet Routing Machine](http://www.liedman.net/leaflet-routing-machine/) - add routing to a Leaflet map.
* [jQuery](https://jquery.com/) - a library designed to simplify HTML DOM tree traversal and manipulation

#### Python
* [Flask](https://flask.palletsprojects.com/en/2.0.x/) - web framework
* [Pandas](https://pandas.pydata.org/docs/user_guide/index.html) - an open source data analysis and manipulation tool.
* [GeoPandas](https://geopandas.org/) - an open source project to make working with geospatial data in python easier.

#### Plugins
* [Leaflet Alternative Router Guide](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) - if you want to setup other routers.
* [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/) - builtin with the class L.Routing.Mapbox.

<!--Installation-->
## Installation

### Gitpod
To run the project follow this guide:

1. Open project on [Gitpod](http://gitpod.io/#https://github.com/palo-landrae/cycle-path-finder)
2. Create a virtual environment
    ```bash
    python -m venv ./venv --system-site-packages
    ```
3. Activate the virtual environment (venv)
    ```bash
    cd venv && source bin/activate
    ```
4. Install the necessary modules
    ```bash
    pip install -r ../requirements.txt
    ```
5. Change directory to /backend
    ```bash
    cd .. && cd backend
    ```
6. Run the project
    ```bash
    python main.py
    ```

### VS Code (Locally)
To run the project follow this guide:

1. Open your repository folder in an Integrated Terminal
2. Clone the project
    ```bash
    git clone https://github.com/palo-landrae/cycle-path-finder.git
    ```
3. Change directory to /cycle-path-finder
    ```bash
    cd cycle-path-finder
    ```
4. Create a virtual environment
    ```bash
    python -m venv ./venv --system-site-packages
    ```
5. Activate the virtual environment (venv)
    ```bash
    cd venv | venv/Scripts/activate
    ```
6. Return to the root folder and install the necessary modules
    ```bash
    cd .. | pip install -r requirements_local.txt
    ```
7. Change directory to /backend
    ```bash
    cd backend
    ```
8. Run the project
    ```bash
    python main.py
    ```
    
## Contacts

Email: louiandraepalo@gmail.com

GitHub: https://github.com/palo-landrae