import { getItemOnSCM } from "./index";

getItemOnSCM("The Elite Mr. Muhlik | Elite Crew", "730").then((item) => {
    console.log(item.getItemInfo());
});