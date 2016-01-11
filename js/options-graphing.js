/*
* Author: Boris Treskunov
* Modified: Sandra Morini
*/

var chart = null;
var INCREMENT = 10;
var SCALE = 2;
var assets = new Array();
var graphCanvas;
var priceAsOne = true;
var showProfit = true;

function Asset() {
	this.graphType = "callOption";
	this.positionType = "long";
	this.strikePrice = 100;
	this.price = 5;
}

function drawAssetChart(graphCanvas) {
	if (graphCanvas !== undefined) { this.graphCanvas = graphCanvas; }
	var windowSize = getMaxStrike(assets);
	var numPoints = windowSize*SCALE;

	var dataTable = (priceAsOne) ? drawDataAsOne(numPoints) : drawDataSeparately(numPoints);

	var options = {
		title: '',
		legend: 'none',
		hAxis: {title: 'ST'},
		vAxis: {
			title: 'PyG',
			viewWindowMode: 'explicit',
			viewWindow: {min: -1*windowSize, max: windowSize}
		}
	};

	chart = new google.visualization.LineChart(this.graphCanvas);
	chart.draw(dataTable, options);
}

function drawDataAsOne(numPoints) {
	var data = new google.visualization.DataTable();
	// Declare Columns
	data.addColumn('number', 'Spot Price');
	data.addColumn('number', 'Payoff');

	var j = 0;
	var dataArray = new Array();
	for (var i = 0; i <= numPoints; i+=INCREMENT) {
		var payoff = 0;
		for (var k = 0; k < assets.length; k++) {
			payoff += getDataPointValue(assets[k], i);
		}
		dataArray[j] = [i, payoff];
		j++;
	}
	data.addRows(dataArray);

	return data;
}

function getDataPointValue(asset, base) {
	var strikePrice = asset.strikePrice;
	var price = showProfit ? asset.price: 0;
	switch(asset.graphType) {
		case "callOption":
			if (asset.positionType === "long") {
				return parseFloat(Math.max(0, base - strikePrice) - price);
			} else {
				return parseFloat(Math.min(0, strikePrice - base) + price);
			}
			break;
		case "putOption":
			if (asset.positionType === "long") {
				return parseFloat(Math.max(0, strikePrice - base) - price);
			} else {
				return parseFloat(Math.min(0, base - strikePrice) + price);
			}
			break;
		case "underlyingAsset":
			if (asset.positionType === "long") {
				return base - price;
			} else {
				return -1*base + price;
			}
			break;
	}
}

function getDataForAsset(asset, numPoints) {
	switch(asset.graphType) {
		case "callOption":
			return drawCall(asset, numPoints);
		case "putOption":
			return drawPut(asset, numPoints);
		case "underlyingAsset":
			return drawUnderlying(asset, numPoints);
	}
}

function drawCall(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, parseFloat(Math.max(0, i - asset.strikePrice) - price)];
				j++;
			}
			break;
		case "short":
			console.log(price);
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, parseFloat(Math.min(0, asset.strikePrice - i) + price)];
				j++;
			}
			break;
	}
	return dataRows;
}

function drawPut(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, parseFloat(Math.max(0, asset.strikePrice - i) - price)];
				j++;
			}
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, parseFloat(Math.min(0, i - asset.strikePrice) + price)];
				j++;
			}
			break;
	}
	return dataRows;
}

function drawUnderlying(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, i - price];
				j++;
			}
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
				dataRows[j] = [i, -1*i + price];
				j++;
			}
			break;
	}
	return dataRows;
}

function getName(graphType) {
	switch(graphType) {
		case "callOption":
			return "Call";
		case "putOption":
			return "Put";
		case "underlyingAsset":
			return "Subyacente";
	}
}

function getMaxStrike(assets) {
	var maxStrike = 0;
	for (var i = 0; i < assets.length; i++) {
		maxStrike = (assets[i].strikePrice > maxStrike) ? assets[i].strikePrice : maxStrike;
	}
	return maxStrike;
}

// Handle changes to asset parameters
$("#positionSelect").change(function() {
	assets[0].positionType = $("#positionSelect").val().toLowerCase();
	drawAssetChart();
});

$("#graphTypeSelect").change(function() {
	var graphType = $("#graphTypeSelect").val();
	assets[0].graphType = graphType;

	switch (graphType) {
		case "callOption":
			$("#price-label").html("Precio:");
			$("#strike-label").removeClass("hidden");
			$("#inputStrike").removeClass("hidden");
			$("#positionSelect").html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice").val(5);
			assets[0].price = 5;
			break;
		case "putOption":
			$("#price-label").html("Precio:");
			$("#strike-label").removeClass("hidden");
			$("#inputStrike").removeClass("hidden");
			$("#positionSelect").html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice").val(5);
			assets[0].price = 5;
			break;
		case "underlyingAsset":
			$("#price-label").html("Precio:");
			$("#strike-label").addClass("hidden");
			$("#inputStrike").addClass("hidden");
			$("#positionSelect").html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice").val(100);
			assets[0].price = 100;
			break;
	}
	drawAssetChart();
});

$("#inputStrike").blur(function() {
	assets[0].strikePrice = $("#inputStrike").val();
	drawAssetChart();
});

$("#inputStrike").keypress(function(e) {
	if (e.keyCode == 13) {
		assets[0].strikePrice = $("#inputStrike").val();
		drawAssetChart();
	}
});

$("#inputPrice").blur(function() {
	assets[0].price = parseFloat($("#inputPrice").val());
	drawAssetChart();
});

$("#inputPrice").keypress(function(e) {
	if (e.keyCode == 13) {
		assets[0].price = parseFloat($("#inputPrice").val());
		drawAssetChart();
	}
});

function addGraph() {
	assetCount = assets.length;
	graphOptionsHTML = '<div id="asset-options"><hr>' +
						'<form id="form' + assetCount + '">' +
						'<table>' +
	                	'<tr><td>Activo:</td><td><select id="graphTypeSelect' + assetCount + '">' +
                      	'<option value="callOption">Call</option>' +
                      	'<option value="putOption">Put</option>' +
                      	'<option value="underlyingAsset">Subyacente</option>' +
	                    '</select></td>' +
	                    '<td>Posición:</td><td><select id="positionSelect' + assetCount + '">' +
                      	'<option value="long">Compra</option>' +
                      	'<option value="short">Venta</option>' +
                    	'</select></td></tr>' +
                    	'<tr><td>Precio:</td><td><input type="number" id="inputPrice' + assetCount +'" placeholder=5 value=5></td>' +
                    	'<td>Precio Ejercicio:</td><td><input type="number" id="inputStrike' + assetCount + '" placeholder=100 value=100></td></tr>' +
                		'</table>' +
                		'<p align="center">' +
 		                '<button onclick="addGraph()">Añadir Activo</button>' +
        		        '<button id="removeGraph' + assetCount + '">Eliminar Activo</button>' +	
						'</p>' +
			            '</form>' +
        				'</div>';
    // add the new HTML to the page
	$("#asset-options").append(graphOptionsHTML);

	$("#removeGraph" + assetCount).data('assetIndex', assetCount);
	$("#removeGraph" + assetCount).click(function() {
		index = $(this).data('assetIndex');
		$("#asset-options").children()[index].remove();
		assets.splice(index, 1);
		drawAssetChart();
		for (var i = index + 1; i < assetCount + index; i++) {
			$("#removeGraph" + i).data('assetIndex', $("#removeGraph" + i).data('assetIndex') - 1);
		}
	});

	$("#positionSelect" + assetCount).data('assetIndex', assetCount);
	$("#positionSelect" + assetCount).change(function() {
		index = $(this).data('assetIndex');
		assets[index].positionType = $("#positionSelect" + index).val().toLowerCase();
		drawAssetChart();
	});

	$("#graphTypeSelect" + assetCount).data('assetIndex', assetCount);
	$("#graphTypeSelect" + assetCount).change(function() {
		index = $(this).data('assetIndex');
		var graphType = $("#graphTypeSelect" + index).val();
		assets[index].graphType = graphType;

		switch (graphType) {
		case "callOption":
			$("#price-label" + index).html("Precio:");
			$("#strike-label" + index).removeClass("hidden");
			$("#inputStrike" + index).removeClass("hidden");
			$("#positionSelect" + index).html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice" + index).val(5);
			assets[index].price = 5;
			break;
		case "putOption":
			$("#price-label" + index).html("Precio:");
			$("#strike-label" + index).removeClass("hidden");
			$("#inputStrike" + index).removeClass("hidden");
			$("#positionSelect" + index).html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice" + index).val(5);
			assets[index].price = 5;
			break;
		case "underlyingAsset":
			$("#price-label" + index).html("Precio:");
			$("#strike-label" + index).addClass("hidden");
			$("#inputStrike" + index).addClass("hidden");
			$("#positionSelect" + index).html(
					'<option value="long">Compra</option>' +
					'<option value="short">Venta</option>');
			$("#inputPrice" + index).val(100);
			assets[index].price = 100;
			break;
	}
		drawAssetChart();
	});

	$("#inputStrike" + assetCount).data('assetIndex', assetCount);
	$("#inputStrike" + assetCount).blur(function() {
		index = $(this).data('assetIndex');
		assets[index].strikePrice = $("#inputStrike" + assetCount).val();
		drawAssetChart();
	});

	$("#inputStrike"  + assetCount).keypress(function(e) {
		if (e.keyCode == 13) {
			index = $(this).data('assetIndex');
			assets[index].strikePrice = $("#inputStrike" + assetCount).val();
			drawAssetChart();
		}
	});

	$("#inputPrice" + assetCount).data('assetIndex', assetCount);
	$("#inputPrice" + assetCount).blur(function() {
		index = $(this).data('assetIndex');
		assets[index].price = parseFloat($("#inputPrice" + assetCount).val());
		drawAssetChart();
	});

	$("#inputPrice"  + assetCount).keypress(function(e) {
		if (e.keyCode == 13) {
			index = $(this).data('assetIndex');
			assets[index].price = parseFloat($("#inputPrice" + assetCount).val());
			drawAssetChart();
		}
	});

	$("#form" + assetCount).submit(function () {
		return false;
	});

	// Add the new asset onto the array
	assets.push(new Asset());
	drawAssetChart();
}