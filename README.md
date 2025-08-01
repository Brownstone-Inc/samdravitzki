# dravitzki.com

The idea of this repo is to have a single place I can experiment and publish small projects focused around learning how to build fun and original interactive experiences

They say the first 10 games you make are not going to be good, this is is a place to experiment and learn the kind of skills to make unique fun interactive things

## Projects

The `src/` folder contains all of the projects. Each project contains a `README.md` file describing what it is aswell as its scope and progress

## Analyitcs

Ultimately the goal is for people to visit and explore the projects in this repository and so google analytics has been configured to be able to get that feedback

## General work

Things to do that aren't realated to any project in specific. Includes work on the site, devops and improvements to developer experience

### The site

- [ ] Basic design centered around a cool logo
  - a character as the logo would be cool. would like if it had the simplicity of a web icon
  - inspo
    - lots of different designs of icons to take inspo from at - https://www.toools.design/free-open-source-icon-libraries
    - simple face character like the following could work - https://iconmonstr.com/?s=face, specifically https://iconmonstr.com/smiley-15-svg/
    - this cat with sunglasses is also pretty cool, I like the roundedness - https://www.streamlinehq.com/icons/flex-remix?search=cat&icon=ico_nIkbkPG7WZL74GtV
    - like the designs in general of the faces in the flex remix icon library - https://www.streamlinehq.com/icons/flex-remix?search=face
- [ ] Some way of communicating what each project is and how to interact with them
- [ ] Mobile friendly
- [ ] Implement more extensible approach to adding new games to the site
- [ ] Someway for any viewers to give feedback
- [ ] Ability to visibility of projects within site
- [x] Analytics

### Maintence and maintainability

All the things that need to be done to support building and maintain these projects

- [ ] Linting
- [ ] Dependency bot
- [ ] Publish coverage reports (using codecov?)
- [x] Unit test runner
- [x] Formatting

### Continuous Integration

- [ ] Automate linting in the CI
- [x] Automate unit tests in the CI

### Continuous deployment

- [ ] Smoke tests to validate deployment was successful
- [x] Define infrastrcuture using IaC and apply changes on commit to `main`
- [x] Automate deployment on commit to `main`
- [x] Move from github pages to Azure
  - swa supports route fallbacks

### Development environment

- [x] Use GitHub codespaces making a portable development environment
