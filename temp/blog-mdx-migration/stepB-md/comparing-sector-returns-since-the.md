I built my first interactive web app and got all geared up to share it here on Substack, only to discover that Substack offers no way to embed it! Madness. Well, I offer a couple sample outputs below, but if you’d like to play with the interactive version, you can just [click here](https://chriscarrollsmith.shinyapps.io/c19-return-comparer/) to view it on the web.

# Equal-weight strategies have outperformed

The interactive web app offers a couple different ways to slice the data: either by equal-weighted returns or market-weighted returns.

As you can see from the plots below, there’s not a *huge* difference between the two, but equal weighting has tended to exaggerate sector performance since the appearance of Covid-19. Underperforming sectors underperformed a bit more in an equal-weighted strategy, and overperforming sectors overperformed a bit more.

<div class="captioned-image-container">

<figure>
<a href="https://substackcdn.com/image/fetch/$s_!qYei!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg" class="image-link image2 is-viewable-img" target="_blank" data-component-name="Image2ToDOM"></a>
<div class="image2-inset">
<img src="https://substackcdn.com/image/fetch/$s_!qYei!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg" class="sizing-normal" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:819,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:504414,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/jpeg&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" srcset="https://substackcdn.com/image/fetch/$s_!qYei!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg 424w, https://substackcdn.com/image/fetch/$s_!qYei!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg 848w, https://substackcdn.com/image/fetch/$s_!qYei!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!qYei!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61ee8dd3-2385-44b4-833b-3b553309c068_2880x1620.jpeg 1456w" sizes="100vw" data-fetchpriority="high" width="1456" height="819" />
<div class="image-link-expand">
<div class="pencraft pc-display-flex pc-gap-8 pc-reset">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXJlZnJlc2gtY3ciPjxwYXRoIGQ9Ik0zIDEyYTkgOSAwIDAgMSA5LTkgOS43NSA5Ljc1IDAgMCAxIDYuNzQgMi43NEwyMSA4Ij48L3BhdGg+PHBhdGggZD0iTTIxIDN2NWgtNSI+PC9wYXRoPjxwYXRoIGQ9Ik0yMSAxMmE5IDkgMCAwIDEtOSA5IDkuNzUgOS43NSAwIDAgMS02Ljc0LTIuNzRMMyAxNiI+PC9wYXRoPjxwYXRoIGQ9Ik04IDE2SDN2NSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-refresh-cw" />
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1heGltaXplMiBsdWNpZGUtbWF4aW1pemUtMiI+PHBvbHlsaW5lIHBvaW50cz0iMTUgMyAyMSAzIDIxIDkiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz0iOSAyMSAzIDIxIDMgMTUiPjwvcG9seWxpbmU+PGxpbmUgeDE9IjIxIiB4Mj0iMTQiIHkxPSIzIiB5Mj0iMTAiPjwvbGluZT48bGluZSB4MT0iMyIgeDI9IjEwIiB5MT0iMjEiIHkyPSIxNCI+PC9saW5lPjwvc3ZnPg==" class="lucide lucide-maximize2 lucide-maximize-2" />
</div>
</div>
</div>
</figure>

</div>

Overall, it’s been a good few years for equal-weighted strategies, mostly because we’re coming out of a bit of a decade-long large-cap bubble. Mega-firms continue to have advantages of technology and scale, but recently we’ve seen that they also suffer from bloat and institutional inertia.

Just look at how OpenAI’s agility as a small firm has allowed it to outcompete Google in AI for end consumers. Google reportedly has better AI models, but for legal and PR reasons, it has been reluctant to bring a product to market. OpenAI, meanwhile, just went for it, and has dominated the market as a result.

The big tech conglomerates are also recently discovering that they hired way too many people over the last few years.

# Energy is the counterintuitive Covid winner, and communications the loser

Another feature of the interactive web app is that you can check or uncheck the various sectors to include or exclude them from the chart. For instance, let’s keep just the top two and the bottom three sectors on the chart:

<div class="captioned-image-container">

<figure>
<a href="https://substackcdn.com/image/fetch/$s_!ZGvm!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg" class="image-link image2 is-viewable-img" target="_blank" data-component-name="Image2ToDOM"></a>
<div class="image2-inset">
<img src="https://substackcdn.com/image/fetch/$s_!ZGvm!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg" class="sizing-normal" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:819,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:332913,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/jpeg&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" srcset="https://substackcdn.com/image/fetch/$s_!ZGvm!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg 424w, https://substackcdn.com/image/fetch/$s_!ZGvm!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg 848w, https://substackcdn.com/image/fetch/$s_!ZGvm!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!ZGvm!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F05dfb933-143f-489b-9cf2-1e0ee09b7701_2880x1620.jpeg 1456w" sizes="100vw" loading="lazy" width="1456" height="819" />
<div class="image-link-expand">
<div class="pencraft pc-display-flex pc-gap-8 pc-reset">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXJlZnJlc2gtY3ciPjxwYXRoIGQ9Ik0zIDEyYTkgOSAwIDAgMSA5LTkgOS43NSA5Ljc1IDAgMCAxIDYuNzQgMi43NEwyMSA4Ij48L3BhdGg+PHBhdGggZD0iTTIxIDN2NWgtNSI+PC9wYXRoPjxwYXRoIGQ9Ik0yMSAxMmE5IDkgMCAwIDEtOSA5IDkuNzUgOS43NSAwIDAgMS02Ljc0LTIuNzRMMyAxNiI+PC9wYXRoPjxwYXRoIGQ9Ik04IDE2SDN2NSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-refresh-cw" />
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1heGltaXplMiBsdWNpZGUtbWF4aW1pemUtMiI+PHBvbHlsaW5lIHBvaW50cz0iMTUgMyAyMSAzIDIxIDkiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz0iOSAyMSAzIDIxIDMgMTUiPjwvcG9seWxpbmU+PGxpbmUgeDE9IjIxIiB4Mj0iMTQiIHkxPSIzIiB5Mj0iMTAiPjwvbGluZT48bGluZSB4MT0iMyIgeDI9IjEwIiB5MT0iMjEiIHkyPSIxNCI+PC9saW5lPjwvc3ZnPg==" class="lucide lucide-maximize2 lucide-maximize-2" />
</div>
</div>
</div>
</figure>

</div>

The results, I have to say, are counterintuitive. One of the big narratives out of the Covid-19 pandemic was that the pandemic accelerated shifts toward telecommuting and work-from-home. So how can it be that the one sector with *negative* returns from pre-pandemic levels is the Communication Services sector? The traditionally defensive Real Estate and Utilities sectors have also underperformed—not what you would expect in a pandemic, although the collapse of Real Estate demand makes sense with commercial storefront closures.

The outperformance of Energy is unexpected, as well. Covid-19 heavily impacted the transportation industry, reducing demand for passenger air and sea travel. You’d think that this would have killed fuel demand. And indeed, Energy was the hardest-hit sector in the early days of the pandemic, with a dramatic \>50% plunge. But the sector came roaring back to also make, by far, the highest highs from pre-pandemic levels. As of today, the sector is up over 100%, no matter how you weight the index. The second-place performance of the Materials sector makes a bit more sense, given how the pandemic shifted demand from services to physical goods.

To some extent, this counterintuitive sector performance is related to underlying structural issues in the respective sectors that had nothing to do with the pandemic. The Communication Services sector had gotten a little oversaturated after a decade of strong performance, and the Energy sector had gotten pretty underinvested after a decade-long lag. Thus, we ended up oversupplied with Communications Services and undersupplied with Energy.

And then there’s the odd way that the pandemic “pulled forward” Communications Services demand and deferred Energy demand into the future, which exaggerated the underlying supply dynamics. Communications Services firms overinvested during the pandemic, with massive hiring. Energy firms underinvested and underproduced, shuttering lots of oil wells because prices were down. When the country opened back up with trillions of dollars of stimulus burning holes in people’s pockets, Communications Services revenue growth went negative, and there just wasn’t enough Energy to go around.

I suspect things will start to normalize as we move forward from here. Mind you, Energy and Materials may stay hot for a while, because there’s a war on, the sectors are still underinvested, and inventories are low. Oil and gas firms have been reluctant to drill new wells, because so many governments are working on phasing out fossil fuels. But central banks are working on killing demand by raising interest rates, and hopefully new technological developments in renewables, energy storage, and grid balancing will help calm things down. Meanwhile, Communications Services firms are tightening their belts and starting to adjust their strategies to make themselves more competitive in the future, so I suspect we’ll see them return to cash flow growth.

## **Bibliography**

Dancho M, Vaughan D (2022). tidyquant: Tidy Quantitative Financial Analysis\_. R package version 1.0.6. <https://CRAN.R-project.org/package=tidyquant>.

R Core Team (2022). R: A language and environment for statistical computing. R Foundation for Statistical Computing, Vienna, Austria. <https://www.R-project.org/>.

Wickham H, et al. (2019). “Welcome to the tidyverse.” *Journal of Open Source Software*, 4(43), 1686. <https://doi.org/10.21105/joss.01686>.

<div>

------------------------------------------------------------------------

</div>

Code for Shiny app: [Github](https://github.com/chriscarrollsmith/modelingmarkets/tree/main/c19-return-comparer)

Code to scrape data: [Github](https://github.com/chriscarrollsmith/modelingmarkets/blob/main/C19SectorReturns.R)
