var controller = new Controller();


function Controller() {
    var view = new View(),
        model = new Model();

    shipPlacement();
    function shipPlacement() {
        model.playerField.addShip(new Ship(model.sheepsSizeOrder.shift()));

        document.getElementById("canvas").addEventListener("mousemove", placementEvent);
        document.getElementById("canvas").addEventListener("click", establishShip);
        window.addEventListener("keypress", changeShipOrientation);

        function placementEvent(event) {
            var position = view.playerField.getPosition(event);
            if (position !== null)
            {
                if (model.playerField.ships[model.playerField.ships.length - 1]
                        .isNewPosition(position.posX, position.posY))
                {
                    model.playerField.ships[model.playerField.ships.length - 1]
                        .setPosition(position.posX, position.posY);
                    repaintField(model.playerField, view.playerField);
                }
            }
        }

        function changeShipOrientation(event) {
            if (event.keyCode === 32) {
                model.playerField.ships[model.playerField.ships.length - 1]
                    .toggleOrientation();
                repaintField(model.playerField, view.playerField);
            }
        }

        function establishShip(event) {
            var size;
            if (view.playerField.getPosition(event) !== null &&
                model.playerField.getCollisionWarnings(model.playerField.ships.length - 1) === null) {
                size = model.sheepsSizeOrder.shift();
                if (size !== undefined) {
                    model.playerField.fieldMapAddShip(model.playerField.ships.length - 1);
                    model.playerField.addShip(new Ship(size));

                }
                else {
                    placementFinish();
                }
            }
        }

        function placementFinish() {
            document.getElementById("canvas").removeEventListener("mousemove", placementEvent);
            document.getElementById("canvas").removeEventListener("click", establishShip);
            window.removeEventListener("keypress", changeShipOrientation);
        }
    }

    function repaintField(fieldData, fieldView) {
        // var warnings = ;
        fieldView.clearField();
        fieldView.drawField();
        fieldView.drawShips(fieldData.ships);
        fieldView.drawWarnings(model.playerField.getCollisionWarnings(model.playerField.ships.length - 1));
    }
}

function Model() {
    this.sheepsSizeOrder = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
    this.playerField = new FieldData();
}

function View() {
    var defaultCommonSettings = {
        lineWidth: 2,
        cellSize: 25,
        fieldColor: "#888",
        shipColor: "#00f",
        warningColor: "rgba(255, 0, 0, .5)"
    };
    var playerFieldSettings = {
        fieldPositionX: 900 - (defaultCommonSettings.cellSize + defaultCommonSettings.lineWidth) * 10 - 10,
        fieldPositionY: 10,
        __proto__: defaultCommonSettings
    };
    var computerFieldSettings = {
        fieldPositionX: 10,
        fieldPositionY: 10,
        __proto__: defaultCommonSettings
    };
    this.playerField = new Field(playerFieldSettings);
    this.computerField = new Field(computerFieldSettings);

    this.playerField.drawField();
    this.computerField.drawField();
}

function Field(properties) {
    var lineWidth = properties.lineWidth,
        cellSize = properties.cellSize,
        fieldColor = properties.fieldColor,
        shipColor = properties.shipColor,
        warningColor = properties.warningColor,
        fieldPositionX = properties.fieldPositionX,
        fieldPositionY = properties.fieldPositionY,
        fieldSize = cellSize * 10 + lineWidth * 10;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var that = this;

    this.getPosition = function(event) {
        var canvasPosition = canvas.getBoundingClientRect(),
            result = {posX: Math.floor(((event.clientX - canvasPosition.left - 1) - fieldPositionX) / (cellSize + lineWidth)),
                posY: Math.floor(((event.clientY - canvasPosition.top - 2) - fieldPositionY) / (cellSize + lineWidth))
            };
        if (result.posX < 0 || result.posX > 9 || result.posY < 0 || result.posY > 9 )
        {
            return null;
        }
        else
        {
            return result;
        }
    };

/*    function showPosition(position) {
        if (position === null)
        {
            document.getElementById("result").innerHTML = "Курсор за пределами поля";
        }
        else
        {
            document.getElementById("result").innerHTML = position.posX + "--" + position.posY;
        }

    }*/

    function getCellCoordinateLineX(cellNum) {
        return fieldPositionX + (cellSize + lineWidth) * (cellNum + 1);
    }

    function getCellCoordinateLineY(cellNum) {
        return fieldPositionY + (cellSize + lineWidth) * (cellNum + 1);
    }

    this.drawField = function() {
        var i;
        context.beginPath();
        context.strokeStyle = fieldColor;
        context.lineWidth = lineWidth;
        context.rect(fieldPositionX, fieldPositionY, fieldSize, fieldSize);
        for (i = 0; i < 9; i += 1)
        {
            context.moveTo(fieldPositionX, getCellCoordinateLineY(i));
            context.lineTo(fieldPositionX + fieldSize, getCellCoordinateLineY(i));
            context.moveTo(getCellCoordinateLineX(i), fieldPositionY);
            context.lineTo(getCellCoordinateLineX(i), fieldPositionY + fieldSize);
        }
        context.stroke();
        context.closePath();
    };

    function getCoordinateOffset(cellNum) {
        return (cellSize + lineWidth) * cellNum;
    }

    this.drawShips = function (ships) {
        var max,
            i;

        for (max = ships.length, i = 0; i < max; i += 1) {
            that.drawShip(ships[i].getLocation());
        }
    };

    /*Рисует корабль на поле. Принимает объект location, где:
    * location.orientation - ориентация корабля (вертикальная/горизонтальная)
    * location.x - позиция по оси x
    * location.y - позиция по оси y
    * location.size - размер корабля*/
    this.drawShip = function(location) {
        var shipHeight,
            shipWidth;

        if (location.orientation === "horizontal")
        {
            shipWidth = cellSize + lineWidth;
            shipHeight = (cellSize + lineWidth) *  location.size;
        }
        else
        {
            shipHeight = cellSize + lineWidth;
            shipWidth = (cellSize + lineWidth) *  location.size;
        }

        context.beginPath();
        context.strokeStyle = shipColor;
        context.lineWidth = lineWidth;

        context.rect(
            fieldPositionX + getCoordinateOffset(location.x),
            fieldPositionY + getCoordinateOffset(location.y),
            shipHeight,
            shipWidth);

        context.stroke();
        context.closePath();
    };

    this.drawWarnings = function(warnings) {
        var i,
            max;
        if (warnings !== null) {
            for (max = warnings.length, i = 0; i < max; i += 1) {
                context.beginPath();
                context.fillStyle = warningColor;
                context.fillRect(
                    fieldPositionX + getCoordinateOffset(warnings[i].x),
                    fieldPositionY + getCoordinateOffset(warnings[i].y),
                    cellSize + lineWidth,
                    cellSize + lineWidth
                );
                context.stroke();
                context.closePath();
            }
        }

    };

    this.clearField = function() {
        context.clearRect(fieldPositionX, fieldPositionY, fieldSize, fieldSize);
    };
}

function FieldData() {
    var that = this,
        fieldMap = [];
    var EMPTY = 0,
        SHIP = 1,
        DEAD_SHIP = 2,
        MISS = 3,
        SHIP_INDENT = 4;
    this.ships = [];
    var i, j;

    for (i = 0; i < 10; i += 1)
    {
        fieldMap[i] = [];
        for (j = 0; j < 10; j += 1)
        {
            fieldMap[i][j] = EMPTY;
        }
    }

    this.addShip = function(ship) {
        if (that.ships.length > 0 && that.ships[that.ships.length - 1].getOrientation() === "vertical") {
            ship.toggleOrientation();
        }
        that.ships.push(ship);
    };

    this.getShips = function () {
        return that.ships;
    };

    this.fieldMapAddShip = function(index) {
        var i,
            location = that.ships[index].getLocation();
        if (location.orientation === "horizontal") {
            for (i = 0; i < location.size; i += 1) {
                fieldMap[location.x + i][location.y] = SHIP;
            }
        }
        else {
            for (i = 0; i < location.size; i += 1) {
                fieldMap[location.x][location.y + i] = SHIP;
            }
        }
        addShipEmptySpace(index);
    };

    function addShipEmptySpace(index) {
        var i,
            j,
            maxI,
            maxJ,
            location = that.ships[index].getLocation();

        if (location.orientation === "horizontal") {
            maxI = location.x + location.size;
            maxJ = location.y + 1;
        }
        else {
            maxI = location.x + 1;
            maxJ = location.y + location.size;
        }

        for (i = location.x - 1; i <= maxI; i += 1) {
            for (j = location.y - 1; j <= maxJ; j += 1) {
                if ((i >= 0 && i <=9 && j >= 0 && j <= 9) && fieldMap[i][j] !== SHIP) {
                    fieldMap[i][j] = SHIP_INDENT;
                }
            }
        }
    }

    this.getCollisionWarnings = function(index) {
        var i,
            warnings = [],
            location = that.ships[index].getLocation();

        if (location.orientation === "horizontal") {
            for (i = 0; i < location.size; i += 1) {
                if (fieldMap[location.x + i][location.y] === SHIP ||
                    fieldMap[location.x + i][location.y] === SHIP_INDENT) {
                    warnings.push({x: location.x + i, y: location.y})
                }
            }
        }
        else {
            for (i = 0; i < location.size; i += 1) {
                if (fieldMap[location.x][location.y + i] === SHIP ||
                    fieldMap[location.x][location.y + i] === SHIP_INDENT) {
                    warnings.push({x: location.x, y: location.y + i})
                }
            }
        }
        if (warnings.length === 0) {
            return null;
        }
        else {
            return warnings;
        }

    };
}

function Ship(shipSize) {
    var size = shipSize,
        health = shipSize,
        positionX = null,
        positionY = null,
        orientation = "horizontal";

    this.setPosition = function(x, y) {
        if (!(orientation === "horizontal" && x + size > 10)) {
            positionX = x;
        }
        if (!(orientation === "vertical" && y + size > 10)) {
            positionY = y;
        }
    };

    this.isNewPosition = function(x, y) {
        if (positionX !== x || positionY !== y) {
            return true;
        }
        else {
            return false;
        }

    };

    this.getLocation = function() {
        return {
            x: positionX,
            y: positionY,
            size: size,
            orientation: orientation
        };
    };

    this.toggleOrientation = function () {
        if (orientation === "horizontal") {
            orientation = "vertical";
            if (positionY + size > 10) {
                positionY -= positionY + size - 10;
            }
        }
        else {
            orientation = "horizontal";
            if (positionX + size > 10) {
                positionX -= positionX + size - 10;
            }
        }
    };

    this.getOrientation = function () {
        return orientation;
    };
}