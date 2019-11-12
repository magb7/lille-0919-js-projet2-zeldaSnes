import React from "react";
import Map from "./Map";
import "./Game.css";
import Player from "./Player";
import GameTopBar from "./GameTopBar";
import Ruby from "./Ruby";
import Sword from "./Sword";
import { tilesMap } from "./tilesMap.js";
import NPC from "./NPC/NPC.jsx";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 3,
      y: 4,
      HP: 8,
      keyName: "ArrowDown",
      blocked: false,
      canMove: true,
      haveSword: false,
      swordPosition: [{ x: 6, y: 3, swordClass: "Sword" }],
      rubyCounter: 0,
      rubyList: [
        { x: 3, y: 5, rubyClass: "Ruby" },
        { x: 6, y: 8, rubyClass: "Ruby" },
        { x: 9, y: 12, rubyClass: "Ruby" },
        { x: 15, y: 6, rubyClass: "Ruby" }
      ],
      direction: "down",
      NPC: {
        x: 10,
        y: 10,
        isAlive: true,
        direction: "up"
      },
      pressKey: 0
    };
  }

  indexNPCmove = 0;

  // Method which get inputs from the keyboard on all the screen
  componentDidMount() {
    window.onkeydown = event => {
      if (this.state.canMove) {
        this.setState({ canMove: false });
        setTimeout(() => {
          this.setState({ canMove: true });
        }, 120);
        this.getMovement(event);
      }
      this.attack(event);
    };
  }

  makeNpcMove = setInterval(() => {
    if (this.state.NPC.isAlive) {
      if (this.indexNPCmove > this.NPCmoves.length - 1) {
        this.indexNPCmove = 0;
      }
      this.NPCMove(this.indexNPCmove);
    } else {
      clearInterval(this.makeNpcMove);
    }
  }, 1000);

  isMovePossible(x, y) {
    const topBorder = 0;
    const leftBorder = 0;
    const bottomBorder = 14;
    const rightBorder = 19;

    if (
      rightBorder >= x &&
      leftBorder <= x &&
      bottomBorder >= y &&
      topBorder <= y &&
      !tilesMap[y][x].includes("Z") &&
      (x !== this.state.NPC.x ||
        y !== this.state.NPC.y ||
        !this.state.NPC.isAlive)
    ) {
      return true;
    } else {
      return false;
    }
  }

  //  Method which get inputs from ComponentDidMount (Game component) and send the correct movment to do on the Player
  getMovement(event) {
    let newKey = event.key;
    let newPositionX = this.state.x;
    let newPositionY = this.state.y;
    let x = this.state.x;
    let y = this.state.y;
    let newDirection;


    if (newKey === this.state.keyName) {
      switch (newKey) {
        case "ArrowLeft":
          event.preventDefault();
          newPositionX = x - 1;
          newDirection = "left";

          break;

        case "ArrowUp":
          event.preventDefault();
          newPositionY = y - 1;
          newDirection = "up";

          break;

        case "ArrowRight":
          event.preventDefault();
          newPositionX = x + 1;
          newDirection = "right";
          break;

        case "ArrowDown":
          event.preventDefault();
          newPositionY = y + 1;
          newDirection = "down";
          break;
        default:
          return;
      }
      if (this.isMovePossible(newPositionX, newPositionY)) {
        console.log("ok");
        this.setState({
          direction: newDirection,
          x: newPositionX,
          y: newPositionY,
          keyName: newKey
        });
      } else {
        this.playBounce();
      }
    }
    //if player can not move just change the asset direction
    else {
      switch (newKey) {
        case "ArrowLeft":
          event.preventDefault();
          this.setState({
            direction: "left",
            keyName: newKey
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          this.setState({ direction: "up", keyName: newKey });
          break;

        case "ArrowRight":
          event.preventDefault();
          this.setState({ direction: "right", keyName: newKey });
          break;

        case "ArrowDown":
          event.preventDefault();
          this.setState({ direction: "down", keyName: newKey });
          break;
        default:
          break;
      }
    }
    this.setState({ pressKey: this.state.pressKey + 1 });
    this.getRuby();
    this.getSword();
  }

  // This function check if the ruby position correspond to the player position and remove the concerned ruby from the rubyList array + incrementing rubyCounter by 1
  getRuby() {
    let xPlayer = this.state.x;
    let yPlayer = this.state.y;
    let newRubyList = this.state.rubyList;

    for (let i = 0; i < newRubyList.length; i++) {
      if (newRubyList[i].x === xPlayer && newRubyList[i].y === yPlayer) {
        this.setState((newRubyList[i] = { rubyClass: "RubyTaken" }));
        setTimeout(() => {
          this.setState({
            newRubyList: newRubyList.splice(i, 1),
            rubyCounter: this.state.rubyCounter + 1
          });
        }, 200);
        this.props.playRuby();
      }
    }
  }

  // This function check if the sword position correspond to the player position and remove the concerned sword from the swordPosition array + showing sword in WeaponSlot
  getSword() {
    let xPlayer = this.state.x;
    let yPlayer = this.state.y;
    const swordPosition = this.state.swordPosition;
    let haveSword = this.state.haveSword;
    for (let i = 0; i < swordPosition.length; i++) {
      if (
        swordPosition[i].x === xPlayer &&
        swordPosition[i].y === yPlayer &&
        haveSword === false
      ) {
        this.playSword();
        this.setState((swordPosition[i] = { swordClass: "SwordTaken" }));
        this.setState({
          swordPosition: swordPosition.splice(i, 1),
          haveSword: true
        });
      }
    }
  }
  // This function is used to play sword pickup sound
  playSword() {
    const pickupSword = new Audio("sound/getSword.mp3");
    pickupSword.play();
  }

  attack(event) {
    let newKeyCode = event.key;
    let haveSword = this.state.haveSword;
    if (newKeyCode === "e" && haveSword === true)
      switch (this.state.direction) {
        case "left":
          if (this.state.NPC.x === this.state.x - 1) {
            this.setState({
              NPC: {
                ...this.state.NPC,
                isAlive: false
              }
            });
          }
          break;
        case "up":
          if (this.state.NPC.y === this.state.y - 1) {
            this.setState({
              NPC: {
                ...this.state.NPC,
                isAlive: false
              }
            });
          }
          break;
        case "right":
          if (this.state.NPC.x === this.state.x + 1) {
            this.setState({
              NPC: {
                ...this.state.NPC,
                isAlive: false
              }
            });
          }
          break;
        case "down":
          if (this.state.NPC.y === this.state.y + 1) {
            this.setState({
              NPC: {
                ...this.state.NPC,
                isAlive: false
              }
            });
          }
          break;
      }
  }

  NPCmoves = [
    "up",
    "up",
    "left",
    "left",
    "left",
    "left",
    "down",
    "down",
    "down",
    "down",
    "down",
    "right",
    "right",
    "right",
    "right",
    "up",
    "up",
    "up"
  ];

  NPCMove(indexNPCmove) {
    let newNPCPosition = 0;
    switch (this.NPCmoves[indexNPCmove]) {
      case "left":
        newNPCPosition = this.state.NPC.x - 1;
        if (
          newNPCPosition !== this.state.x ||
          this.state.y !== this.state.NPC.y
        ) {
          this.setState({
            NPC: {
              ...this.state.NPC,
              x: newNPCPosition,
              direction: this.NPCmoves[indexNPCmove]
            }
          });
          this.indexNPCmove += 1;
        }
        break;
      case "up":
        newNPCPosition = this.state.NPC.y - 1;
        if (
          newNPCPosition !== this.state.y ||
          this.state.x !== this.state.xNPC
        ) {
          this.setState({
            NPC: {
              ...this.state.NPC,
              y: newNPCPosition,
              direction: this.NPCmoves[indexNPCmove]
            }
          });
          this.indexNPCmove += 1;
        }
        break;
      case "right":
        newNPCPosition = this.state.NPC.x + 1;
        if (
          newNPCPosition !== this.state.x ||
          this.state.y !== this.state.yNPC
        ) {
          this.setState({
            NPC: {
              ...this.state.NPC,
              x: newNPCPosition,
              direction: this.NPCmoves[indexNPCmove]
            }
          });
          this.indexNPCmove += 1;
        }
        break;
      case "down":
        newNPCPosition = this.state.NPC.y + 1;
        if (
          newNPCPosition !== this.state.y ||
          this.state.x !== this.state.xNPC
        ) {
          this.setState({
            NPC: {
              ...this.state.NPC,
              y: newNPCPosition,
              direction: this.NPCmoves[indexNPCmove]
            }
          });
          this.indexNPCmove += 1;
        }
        break;
      default:
        return;
    }
  }

  render() {
    return (
      <div className="game">
        <GameTopBar
          rubyCounter={this.state.rubyCounter}
          haveSword={this.state.haveSword}
          HP={this.state.HP}
        />
        <div className="gameScreen">
          <Map />
          <Player
            keyName={this.state.keyName}
            x={this.state.x}
            y={this.state.y}
            blocked={this.state.blocked}
            canMove={this.state.canMove}
            pressKey={this.state.pressKey}
          />
          {this.state.rubyList.map(ruby => {
            return (
              <Ruby xRuby={ruby.x} yRuby={ruby.y} rubyClass={ruby.rubyClass} />
            );
          })}
          {this.state.swordPosition.map((sword, index) => {
            return (
              <Sword
                xSword={sword.x}
                ySword={sword.y}
                swordClass={sword.swordClass}
              />
            );
          })}
          {this.state.NPC.isAlive && (
            <NPC
              NPCdirection={this.state.NPC.direction}
              xNPC={this.state.NPC.x}
              yNPC={this.state.NPC.y}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Game;
