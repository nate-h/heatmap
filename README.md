# Nathanial Hapeman's Heatmap Explorer

For my interpretation of the prompt, I decided to go a little above and beyond
and create a tool that allows you to inspect 2d arrays of normalized floats.
You can zoom in and move around and perform click drags to draw rectangles
to represent selected regions.
A picture can then be exported of the selected region and so can the
corresponding values in the underlying data source.
Everything runs pretty fast because I'm using 2 canvases to separate the
selected region from the colorized heatmap.
Some of the things I enjoyed creating were the Viridis color mapper
capabilities and the json data sources created with numpy.
Check that out here: sample-heatmaps/genearteMaps.py.

## Run it

```sh
    # Run this once to install http-server and jest.
    npm install

    # An http server was needed to fetch local json values because CORS.
    # Start the server with:
    npm start
    # Then go to http://localhost:8000/
```

## Testing

```sh
    npm jest
```
