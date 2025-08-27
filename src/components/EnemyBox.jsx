import { useState, useEffect } from "react";
import Healthbar from "./Healthbar";

export default function EnemyBox({ image, health, name, maxhealth}) {
  return (
    <div className="flex items-center">
      <table>
        <tr>
          <td> 
            <div className="w-[12vw]">
              <Healthbar health={health} maxhealth={maxhealth} />
            </div> 
            <p className="text-5xl text-center text-shadow-white text-shadow-lg name ">{name}</p>
          </td>
        </tr>
        <tr>
          <td>
              <img  
                src={image}
                alt="enemy"
                className="w-[18vw] h-auto object-contain"
              />
          </td>
        </tr>
      </table>
    </div>
  );
}



