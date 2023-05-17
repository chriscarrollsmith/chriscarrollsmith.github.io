# README

## Introduction

This is a template for an attractive freelance bookings website built with Vite + React + Calendly and configured for deployment to Github Pages.

## Example

![Site preview](site-preview.gif "Site preview")

See the site live [here](https://chriscarrollsmith.github.io/).

## Prerequisites

You will need to have `npm` installed in your development environment. You will also need a [Calendly](https://calendly.com/) account.

## Creating a repo from the template

Clone the template with the "Use this template button." Assuming you plan to deploy as your homepage on Github pages, make sure to name your cloned repo `{YOUR-GITHUB-USERNAME}.github.io`.

## Customization

To edit the template, you can use Github Codespaces or clone the repo locally to work in the editor of your choice. Preview the site during development with `npm run dev`.

Make sure to:

- Change the 'homepage' attribute in `package.json` to 'https://{YOUR-GITHUB-USERNAME}.github.io'.

- Edit the JSON files, images, and documents in the public folder to customize the site content. 

- Edit the `meta` tags in `index.html` in the root folder.

If you want to deploy somewhere other than Github Pages, you'll also need to change the 'deploy' command in `package.json`.

## Deployment

Deploy site to Github pages with `npm run deploy`. 

Under `Settings > Pages` for your repo, make sure `Source` is set to `Deploy from a branch` and `Branch` is set to `gh-pages`.