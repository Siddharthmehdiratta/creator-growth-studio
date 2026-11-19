# The demo video

`index.html` is the source of the 17-second demo on the home page. It is a HyperFrames
composition: HTML and GSAP, rendered frame by frame to MP4, so every render is identical.

## Change it and re-render

    cd video
    npx hyperframes check --json     # the contract: timing, contrast, type size, dead time
    npx hyperframes snapshot --at 0,9,15   # look at it before rendering
    npx hyperframes render

Then shrink it and copy it into the site. The source render is about 1 MB at 1080p, which is
too heavy for a page that autoplays it, so it ships at 720p:

    ffmpeg -i renders/<file>.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -crf 28 \
      -pix_fmt yuv420p -movflags +faststart -an ../site/public/video/post-score-demo.mp4
    ffmpeg -i ../site/public/video/post-score-demo.mp4 -vf "select=eq(n\,270)" -vframes 1 \
      -q:v 4 ../site/public/video/post-score-demo.jpg

Needs Node 22+, FFmpeg and Chrome. HyperFrames is Apache-2.0, from https://github.com/heygen-com/hyperframes.

## Rules it follows

No photographs of anyone. Palette is the site's own ink and paper, no gradient and no glow.
Type never drops below 28 px so it reads on a phone. The first frame shows the post, because
that frame is the thumbnail wherever the file gets shared.

Two warnings are left open on purpose: the film is silent, because a page video autoplays muted
anyway, and the two timeline elements hold nested markup, which only affects editing it in the
HyperFrames desktop app.
