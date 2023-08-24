module.exports = {
    regionBound: async (location1, location2) => {
        const x1 = location1.x_axis;
        const y1 = location1.y_axis;
        const x2 = location2.x_axis;
        const y2 = location2.y_axis;
        let xMax, xMin, yMax, yMin;
        if (x1 < x2) {
            xMax = x2;
            xMin = x1;
        } else {
            xMax = x1;
            xMin = x2;
        }
        if (y1 < y2) {
            yMax = y2;
            yMin = y1;
        } else {
            yMax = y1;
            yMin = y2;
        }
        const bound = {
            xMax: xMax,
            xMin: xMin,
            yMax: yMax,
            yMin: yMin
        }
        return bound;
    }
}
