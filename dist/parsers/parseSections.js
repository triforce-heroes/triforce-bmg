export function parseSections(e){let n=[];for(;!e.isConsumed();){let r=e.readString(4),t=e.readUnsignedInt32();n.push([r,e.read(t-8)])}return n}