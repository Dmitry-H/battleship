var controller = new Controller();


function Controller() {
    var view = new View(),
        model = new Model();

    shipPlacement();
    repaintField(model.computerField, view.computerField);
    /*Устанавливает события, необходимые для размещения кораблей пользователем*/
    function shipPlacement() {
        model.playerField.addShip(new Ship(model.playerField.sheepsSizeOrder.shift()));

        document.getElementById("canvas").addEventListener("mousemove", placementEvent);
        document.getElementById("canvas").addEventListener("click", establishShip);
        window.addEventListener("keypress", changeShipOrientation);

    }

    /*Вешается на событие движения мыши над полем во время размещения кораблей игроком,
     *перемещает по полю размещаемый корабль*/
    function placementEvent(event) {
        var position = view.playerField.getPosition(event);
        if (position !== null) {
            if (model.playerField.ships[model.playerField.ships.length - 1]
                    .isNewPosition(position.posX, position.posY)) {
                model.playerField.ships[model.playerField.ships.length - 1]
                    .setPosition(position.posX, position.posY);
                repaintField(model.playerField, view.playerField);
            }
        }
    }
    /*Вешается на клавишу смены ориентации корабля (пробел) во время размещения кораблей игроком,
     *меняет его ориентацию (корабля, а не игрока)*/
    function changeShipOrientation(event) {
        if (event.keyCode === 32) {
            model.playerField.ships[model.playerField.ships.length - 1]
                .toggleOrientation();
            repaintField(model.playerField, view.playerField);
        }
    }

    /*Вешается на клик по полю во время размещения кораблей игроком, если позиция корабля допустима, то
     * устанавлевает его на указанное место*/
    function establishShip(event) {
        var size;
        /*Если курсор не за пределами поля и размещаемый корабль не пересекается с уже имеющимися*/
        if (view.playerField.getPosition(event) !== null &&
            model.playerField.getCollisionWarnings(model.playerField.ships.length - 1) === null) {
            size = model.playerField.sheepsSizeOrder.shift();
            /*если ещё остались корабли для размещения*/
            if (size !== undefined) {
                model.playerField.fieldMapAddShip(model.playerField.ships.length - 1);
                model.playerField.addShip(new Ship(size));

            }
            else {
                placementFinish();
            }
        }
    }
    /*Снимает события отвечающие за размещение кораблей игроком*/
    function placementFinish() {
        document.getElementById("canvas").removeEventListener("mousemove", placementEvent);
        document.getElementById("canvas").removeEventListener("click", establishShip);
        window.removeEventListener("keypress", changeShipOrientation);
    }

    /*Очищает и поля и рисует заново пустое поле, корабли и предупреждения о коллизиях (если есть)*/
    function repaintField(fieldData, fieldView) {
        fieldView.clearField();
        fieldView.drawField();
        fieldView.drawShips(fieldData.ships);
        fieldView.drawWarnings(model.playerField.getCollisionWarnings(model.playerField.ships.length - 1));
    }
}

function Model() {
    this.playerField = new FieldData();
    this.computerField = new FieldData();
    this.computerField.ShipsAutoPlacement();
}

function View() {
    var defaultCommonSettings = {
        lineWidth: 2,
        cellSize: 25,
        fieldBGColor: "#1485a8",
        fieldColor: "#777",
        shipColor: "#91ffe6",
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
        fieldBGColor = properties.fieldBGColor,
        fieldColor = properties.fieldColor,
        shipColor = properties.shipColor,
        warningColor = properties.warningColor,
        fieldPositionX = properties.fieldPositionX,
        fieldPositionY = properties.fieldPositionY,
        fieldSize = cellSize * 10 + lineWidth * 10;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var that = this;
    /*Возвращает положение курсора на поле по его координатам, если курсор за
    * пределами поля, возвращается null*/
    this.getPosition = function(event) {
        var canvasPosition = canvas.getBoundingClientRect(),
            result = {posX: Math.floor(((event.clientX - canvasPosition.left - 1) - fieldPositionX) / (cellSize + lineWidth)),
                posY: Math.floor(((event.clientY - canvasPosition.top - 2) - fieldPositionY) / (cellSize + lineWidth))
            };
        if (result.posX < 0 || result.posX > 9 || result.posY < 0 || result.posY > 9 ) {
            return null;
        }
        else {
            return result;
        }
    };

    /*Принимает позицию ячейки на поле, возващает её координаты в пикселах по оси x*/
    function getCellCoordinateLineX(cellNum) {
        return fieldPositionX + (cellSize + lineWidth) * (cellNum + 1);
    }

    /*Принимает позицию ячейки на поле, возващает её координаты в пикселах по оси y*/
    function getCellCoordinateLineY(cellNum) {
        return fieldPositionY + (cellSize + lineWidth) * (cellNum + 1);
    }

    /*Рисует пустое поле*/
    this.drawField = function() {
        var i;
        /*Рисует фон поля*/
        context.beginPath();
        context.fillStyle = fieldBGColor;
        context.fillRect(fieldPositionX, fieldPositionY, fieldSize, fieldSize);
        context.closePath();

        /*Рисует поле*/
        context.beginPath();
        context.strokeStyle = fieldColor;
        context.lineWidth = lineWidth;
        context.rect(fieldPositionX, fieldPositionY, fieldSize, fieldSize);
        for (i = 0; i < 9; i += 1) {
            context.moveTo(fieldPositionX, getCellCoordinateLineY(i));
            context.lineTo(fieldPositionX + fieldSize, getCellCoordinateLineY(i));
            context.moveTo(getCellCoordinateLineX(i), fieldPositionY);
            context.lineTo(getCellCoordinateLineX(i), fieldPositionY + fieldSize);
        }
        context.stroke();
        context.closePath();
    };

    /*Принимает позицию ячейки на поле, возвращает смещение её смещение в пикселах*/
    function getCoordinateOffset(cellNum) {
        return (cellSize + lineWidth) * cellNum;
    }

    /*Рисует все корабли в массиве ships, содержащим объекты типа Ship*/
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

        if (location.orientation === "horizontal") {
            shipWidth = cellSize + lineWidth;
            shipHeight = (cellSize + lineWidth) *  location.size;
        }
        else {
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

    /*Рисует предупреждения в местах коллизий размещаемого корабля с уже размещёнными.
    * Принимает массив объектов warnings, где:
    * warnings[i].x - позиция x расположения коллизии
    * warnings[i].y - позиция y расположения коллизии*/
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

    /*Метод очистки поля, затирает поле прямоугольником*/
    this.clearField = function() {
        context.clearRect(fieldPositionX, fieldPositionY, fieldSize, fieldSize);
    };
}

function FieldData() {
    var that = this,
        fieldMap = []; // Карта поля
    var EMPTY = 0,
        SHIP = 1,
        DEAD_SHIP = 2,
        MISS = 3,
        SHIP_INDENT = 4;
    this.ships = [];
    this.sheepsSizeOrder = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
    var i, j;
    /*Цикл инициализирует карту поля, заполняя её нулями*/
    for (i = 0; i < 10; i += 1) {
        fieldMap[i] = [];
        for (j = 0; j < 10; j += 1) {
            fieldMap[i][j] = EMPTY;
        }
    }
    /*Добавляет новый корабль (объект Ship) в массив ships. Если у последнего размещённого
    * пользователем корабля ориентация была изменена на вертикальную, то у нового корабля
    * она тоже меняется. Нужна чтобы при размещении пользователем корабли оставались в выбраном
    *  пользователем положении*/
    this.addShip = function(ship) {
        if (that.ships.length > 0 && that.ships[that.ships.length - 1].getOrientation() === "vertical") {
            ship.toggleOrientation();
        }
        that.ships.push(ship);
    };

    this.getShips = function () {
        return that.ships;
    };
    /*Добавляет новый корабль на карту, принимает индекс корабля в массиве ships*/
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
    /*Окружает установленный корабль "пустым" пространством на карте размером в одну клетку,
     * в котором нельзя размещать другие корабли*/
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
    /*Возвращает массив объектов с координатами ячеек, кде происходит коллизия
     * размещаемого корабля с уже стоящими. Если таких ячеек нет, то возвращается null*/
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
    /*Метод заполняет поле компьютерного противника случайным образом*/
    this.ShipsAutoPlacement = function () {
        var i,
            max,
            x,
            y,
            extremePoint;
        for (max = that.sheepsSizeOrder.length, i = 0; i < max; i += 1) {
            that.ships.push(new Ship(that.sheepsSizeOrder[i]));
            if (getRandom(0, 1) === 1) {
                that.ships[i].toggleOrientation();
            }
            /* Пока крайняя точка корабля выходит за пределы поля или корабль налазит
             * на уже стоящие корабли*/
            do {
                x = getRandom(0, 9);
                y = getRandom(0, 9);
                if (that.ships[i].getOrientation() === "horizontal") {
                    extremePoint = x + that.sheepsSizeOrder[i];
                }
                else {
                    extremePoint = y + that.sheepsSizeOrder[i];
                }
                that.ships[i].setPosition(x, y);
            } while (extremePoint > 10 || that.getCollisionWarnings(i) !== null);

            that.fieldMapAddShip(i);
        }
    };

    /*Возвращает случайное число от min до max*/
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
}

/*Класс отвечает за отдельный корабль, конструктор принимает размер корабля*/
function Ship(shipSize) {
    var size = shipSize, // Размер корабля
        health = shipSize, // Оставшиеся целые палубы
        positionX = null, // Позиция по оси x
        positionY = null, // Позиция по оси y
        orientation = "horizontal"; // Ориентация (горизонтальная или вертикальная)

    /*Задаёт позицию кораблю. Если по какой-то координате корабль выходит за пределы поля,
    * то данная координата не применяется*/
    this.setPosition = function(x, y) {
        if (!(orientation === "horizontal" && x + size > 10)) {
            positionX = x;
        }
        if (!(orientation === "vertical" && y + size > 10)) {
            positionY = y;
        }
    };
    /*Возвращает истину, если передаваемые координаты корабля не соответствуют текущим.
    * Метод нужен чтобы определить изменилась ли ячейка, над которой расположен курсор,
    * или курсор перемещается в одной и той же ячейке*/
    this.isNewPosition = function(x, y) {
        if (positionX !== x || positionY !== y) {
            return true;
        }
        else {
            return false;
        }

    };
    /*Возвращает объект с информацией о положении корабля*/
    this.getLocation = function() {
        return {
            x: positionX,
            y: positionY,
            size: size,
            orientation: orientation
        };
    };
    /*Изменяет ориентацию корабля*/
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
    /*Возвращает ориентацию корабля*/
    this.getOrientation = function () {
        return orientation;
    };
}