{
  var comp = app.project.activeItem;

  if (comp instanceof CompItem) {
    app.beginUndoGroup("Dynamic Orientations");

    // Get the selected layers
    var selectedLayers = comp.selectedLayers;

    if (selectedLayers.length < 2) {
      alert(
        "Please select at least two layers (the first layer will dynamically orient towards the closest one, others will look at the first layer)."
      );
    } else {
      // The first selected layer is the layer we want to dynamically orient
      var mainLayer = selectedLayers[0];

      // Build the expression for the first layer to dynamically find and look at the closest layer
      var mainLayerExpression =
        "var closestLayer = null;" +
        "var closestDistance = Infinity;" +
        "var mainPos = position;" +
        "var otherPos, distance;" +
        "for (var i = 1; i <= thisComp.numLayers; i++) {" +
        "  if (i != index) {" +
        "    try {" +
        "      otherPos = thisComp.layer(i).transform.position;" +
        "      distance = length(mainPos, otherPos);" +
        "      if (distance < closestDistance) {" +
        "        closestDistance = distance;" +
        "        closestLayer = thisComp.layer(i);" +
        "      }" +
        "    } catch(e) {}" +
        "  }" +
        "}" +
        "var targetRotation;" +
        "if (closestLayer != null) {" +
        "  var delta = closestLayer.position - mainPos;" +
        "  targetRotation = 180 + radiansToDegrees(Math.atan2(delta[1], delta[0])) - 90;" +
        "} else { targetRotation = rotation; }" + // Maintain current rotation if no closest layer is found
        // Smoothly interpolate the rotation towards the target rotation
        "var currentRotation = rotation;" +
        "var smoothFactor = 0.1; // Adjust for speed of rotation" +
        "var angleDifference = targetRotation - currentRotation;" +
        // Use modulus to handle angle wrapping
        "if (angleDifference > 180) { angleDifference -= 360; }" +
        "if (angleDifference < -180) { angleDifference += 360; }" +
        "rotation + angleDifference * smoothFactor;"; // Adjust the amount of rotation per frame

      // Apply the dynamic expression to the rotation property of the main layer
      mainLayer.transform.rotation.expression = mainLayerExpression;

      // Now, for the rest of the layers, they should look at the main layer
      for (var i = 1; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        // Create expression for orienting the layer towards the main layer using layer name instead of index for stability
        var otherLayersExpression =
          "try {" +
          '  var target = thisComp.layer("' +
          mainLayer.name +
          '").transform.position;' +
          "  var delta = target - position;" +
          "  180 + radiansToDegrees(Math.atan2(delta[1], delta[0])) - 90;" +
          "} catch(e) { 0; }"; // Default to 0 rotation if there's an error

        // Apply the expression to the rotation property of the other layers
        layer.transform.rotation.expression = otherLayersExpression;
      }
    }

    app.endUndoGroup();
  } else {
    alert("Please select a composition and the layers.");
  }
}
