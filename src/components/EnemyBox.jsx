import { useState, useEffect } from "react";
import Healthbar from "./Healthbar";

export default function EnemyBox({ image, health }) {
  return (
    <div className="flex items-center">
      <table>
        <tr>
          <td> 
            <div className="w-[12vw]">
              <Healthbar health={health} maxhealth={100} />
            </div> 
            <p className="text-2xl font-bold font-['Bitcount'] ">Enemy</p>
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



