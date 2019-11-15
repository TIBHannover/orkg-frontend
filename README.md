# ORKG frontend

This is the repository for the frontend of the Open Research Knowledge Grapph (ORKG), which is running live at: https://orkg.org.

## Frontend installation  

### Prerequisites
In order to run the frontend, ensure that Node.js is installed (version >= 6). Check whether you have the right version installed using your command prompt or terminal, run: `node --version`. For more information about installing or upgrading Node.js, see: https://nodejs.org/en/download/.

###  Installation 
Clone this repository: 

    git clone https://gitlab.com/TIBHannover/orkg/orkg-frontend.git

Go to the frontend directory:

    cd orkg-frontend

Install the dependencies by running:

    npm install

Copy the file `default.env` to `.env`:

    cp default.env .env

### Backend service 
In order to run the frontend, the backend needs to be running as well. Please refer to the [ORKG backend repository](https://gitlab.com/TIBHannover/orkg/orkg-backend) for instructions on how to run the backend. Easiest is to run the backend within a docker container. 

Two additional services are used in the frontend. These services are: [ORKG similarity](https://gitlab.com/TIBHannover/orkg/orkg-similarity) and [ORKG annotation](https://gitlab.com/TIBHannover/orkg/annotation). These services are not critical for the frontend to operate, but some for functionalities the message `Couldn't connect to service ... ` appears. This message can be ignored, or can be fixed by running the respective service locally. 

## Running 
Run the following command:

    npm run start

Open the browser and enter the URL of the application: http://localhost:3000/.

# Contributing 

Please feel free to contribute to our code. In case you found any bugs, please [raise an issue](https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues). In case you want to contribute code, [open a merge request](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests). 

We use [React](https://reactjs.org/) as frontend framework. Additionally, we use [Redux](https://redux.js.org/) for state management (but we prefer a local state when possible). For styling we use [Bootstrap](https://getbootstrap.com/) with the package [Reactstrap](https://reactstrap.github.io/). We maintain the following code conventions: 

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), and use [Angular commit types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type)
- Running lint on commit (you cannot commit when your code contains lint errors)
- Run Prettier rules on commit for coding style consistency 
- The [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format is used to automatically generate [our changelog](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/CHANGELOG.md) 
- In the future, we will adhere to the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript)

Happy coding! 😁☕️

## Value plugins

An easy start for contributing is to take a look at [value plugins](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/src/components/ValuePlugins). These plugins allow for converting data into a appropriate visualization. Currently, we support plugins for the following visualizations: `Boolean checkmarks`, `LaTeX preview`, `External links`. The [boolean checkmarks plugin](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/src/components/ValuePlugins/Boolean/Boolean.js) provides an easy example on how to create your own value plugins. 