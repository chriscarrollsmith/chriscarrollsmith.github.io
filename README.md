# README

## Introduction

This is a template for an attractive freelance bookings website built with Vite + React + Calendly and configured for deployment to Github Pages.

## Example

See the site live [here](https://chriscarrollsmith.github.io/).

## Prerequisites

You will need to have `npm` installed in your development environment. You will also need a [Calendly](https://calendly.com/) account.

## Cloning the repo

Clone and rename the repo with `git clone https://github.com/chriscarrollsmith/chriscarrollsmith.github.io.git {YOUR-GITHUB-USERNAME}.github.io`, obviously replacing '{YOUR-GITHUB-USERNAME}' without the braces. Enter the cloned directory with `cd {YOUR-GITHUB-USERNAME}.github.io`.

Log in to your Github account and create an empty repository named `{YOUR-GITHUB-USERNAME}.github.io`, replacing '{YOUR-GITHUB-USERNAME}' without the braces. Under 'Quick setup — if you’ve done this kind of thing before', copy the link that looks like 'https://github.com/yourname/yourproject.git'. 

Go back to the command line and use `git remote add origin {COPIED-LINK-ADDRESS}`, replacing '{COPIED-LINK-ADDRESS}' without the braces. Push your branch to github with `git push -u origin main`.

## Customization

Change the 'homepage' attribute in `package.json` to 'https://{YOUR-GITHUB-USERNAME}.github.io', replacing {YOUR-GITHUB-USERNAME} without the braces. Change the 'name' attribute to any site name you want.

Edit the data, images, and documents in the public folder to customize the site content. Edit the `meta` tags in `index.html` in the root folder.

Preview site during development with `npm run dev`.

If you want to deploy somewhere other than Github Pages, you will need to change the 'deploy' command in `package.json`.

## Deployment

Deploy site to Github pages with `npm run deploy`. 

Under `Settings > Pages` for your repo, make sure `Source` is set to `Deploy from a branch` and `Branch` is set to `gh-pages`.