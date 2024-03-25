# README

## Introduction

This is a template for an attractive freelance booking website built with Vite + React, integrating Calendly + ConvertKit + Formspree, and configured for deployment to Github Pages. One exciting thing about modern web development is that there are so many great third-party services available for making even a static website interactive. A static website allows us to take advantage of free hosting, and third-party services allow us to add features like booking, contact forms, and email marketing without having to write any server-side code. This template shows how to use Calendly to book appointments, Formspree to handle contact form submissions, and ConvertKit to capture newsletter subscriptions, all in a free-hosted website.

## Example

![Site preview](site-preview.gif "Site preview")

See the site live [here](https://chriscarrollsmith.github.io/).

## Prerequisites

You will need to have `npm` installed in your development environment. You will also need a [Calendly](https://calendly.com/) account to use the `Book` component, a [Formspree](https://formspree.io/) account to use the `ContactForm` component, and a [ConvertKit](https://convertkit.com/?lmref=R3jWSQ) account to use the `SubscribeForm` component.

## Creating a repo from the template

Clone the template with the "Use this template button." Assuming you plan to deploy as your homepage on Github pages, make sure to name your cloned repo `{YOUR-GITHUB-USERNAME}.github.io` and install dependencies in your repo folder from the command line with `npm install`.

## Customization

To edit the template, you can use Github Codespaces or clone the repo locally to work in the editor of your choice. Preview the site during development with `npm run dev`.

Make sure to:

- Change the 'homepage' attribute in `package.json` to 'https://{YOUR-GITHUB-USERNAME}.github.io'.

- Edit the JSON files in `src/data` and the images and documents in `public` to customize site appearance. 

- Edit the `meta` tags in `index.html` in the root folder.

If you want to deploy somewhere other than Github Pages, you'll also need to change the 'deploy' command in `package.json`.

## Deployment

To build and deploy the site, run `npm run build`, and then `npm run deploy`.

Under `Settings > Pages` for your repo on Github, make sure `Source` is set to `Deploy from a branch` and `Branch` is set to `gh-pages`.

## Using a custom domain

If you want to use a custom domain instead of the default 'https://{YOUR-GITHUB-USERNAME}.github.io' link, it's a bit complicated, and Github's documentation is atrocious. Here's the rundown on what you need to do:

1. Register a domain name with a domain manager like Godaddy or Domain.com. If you already have a domain you've been using for another website, restore the default DNS settings.
2. Add the domain under your **user** (or **organization**, if the repo belongs to one) "Settings > Pages" on Github. (Not to be confused with the **repo** "Settings > Pages"!)
3. Follow Github's instructions to verify your domain. This will involve going back to your domain manager and creating a DNS record. Here's how I did that on the domain management service I used, Domain.com:
   - Click to "Manage" the domain.
   - Go to "Advanced > DNS & Nameservers" on the menu bar.
   - Go to "DNS Records" tab.
   - Click "Add DNS Record".
   - Set "Type" to "TXT", "Time to Live" to half an hour, and "Name" and "Content" to the values provided by Github.
   - Click "Add DNS".
   - Wait a couple hours for the DNS changes to propagate, then go back to Github "Settings > Pages" and click to finish verification.
4. In your 'https://{YOUR-GITHUB-USERNAME}.github.io' repo on Github, go to the repo "Settings > Pages" (which is different from your user settings) and add your domain.
5. Go back to your domain manager and edit the DNS records:
   - Delete all existing "CNAME" records and any "A" records named "@". (You should leave all other "A" records alone. Only delete the ones named "@".)
   - Create four new records of type "A", named "@". Each record's value/content should be one of the four Github Pages IP addresses: "185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153". Set "Time to Live" to half an hour. You should have an "A" record for each IP address. 
   - Create one record of type "CNAME", named "www", with your custom domain ("{your-domain}.com") as its value/content. (Obviously, replace the curly braces with your custom domain name.) Set "Time to Live" to half an hour.
6. Wait a couple more hours for your DNS changes to propagate, then head back to "Settings > Pages" for your Github repo. If you've done everything correctly, You should see "DNS check successful" under the custom domain field.
7. Click the check box to "Enforce HTTPS". If the DNS check passed, but the box isn't clickable, you may have to remove and re-add your domain. (Or Github may not have issued your site an SSL certificate yet. If you've removed and re-added your site and still can't click the checkbox, take and break for a few hours and then come back and try again.)

This is a super tedious process with a lot of wait time built in, but hopefully these instructions will help you get it done.

Additionally, to use a custom domain, you will need to make a couple changes to your repo's `package.json` file:

1. Change the "homepage" attribute to your custom domain (e.g., "https://{your-domain}.com).
2. Update the "cname" command in `package.json` with your custom domain name, and make sure to run this before deploying from a local machine.
