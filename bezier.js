var bezier = {
    generateBSpline: function (controlPoint, m, degree, xUp, yUp, zUp) {
        var curves = [];
        var knotVector = []
      
        var n = controlPoint.length / 2;
      
      
        // Calculate the knot values based on the degree and number of control points
        for (var i = 0; i < n + degree + 1; i++) {
          if (i < degree + 1) {
            knotVector.push(0);
          } else if (i >= n) {
            knotVector.push(n - degree);
          } else {
            knotVector.push(i - degree);
          }
        }
      
      
      
        var basisFunc = function (i, j, t) {
          if (j == 0) {
            if (knotVector[i] <= t && t < (knotVector[(i + 1)])) {
              return 1;
            } else {
              return 0;
            }
          }
      
          var den1 = knotVector[i + j] - knotVector[i];
          var den2 = knotVector[i + j + 1] - knotVector[i + 1];
      
          var term1 = 0;
          var term2 = 0;
      
      
          if (den1 != 0 && !isNaN(den1)) {
            term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
          }
      
          if (den2 != 0 && !isNaN(den2)) {
            term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
          }
      
          return term1 + term2;
        }
      
      
        for (var t = 0; t < m; t++) {
          var x = 0;
          var y = 0;
      
          var u = (t / m * (knotVector[controlPoint.length / 2] - knotVector[degree])) + knotVector[degree];
      
          //C(t)
          for (var key = 0; key < n; key++) {
      
            var C = basisFunc(key, degree, u);
            x += (controlPoint[key * 2] * C);
            y += (controlPoint[key * 2 + 1] * C);
          }
          curves.push(x+xUp);
          curves.push(y+yUp);
          curves.push(zUp);
          curves.push(0, 0, 0);
      
        }
        return curves;
      }
}