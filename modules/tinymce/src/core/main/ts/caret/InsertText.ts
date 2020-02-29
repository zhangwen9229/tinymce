/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { getElementFromPosition } from '../caret/CaretUtils';
import * as NodeType from '../dom/NodeType';
import { CaretPosition } from '../caret/CaretPosition';
import { Insert, Element } from '@ephox/sugar';
import { Option, Fun, Unicode } from '@ephox/katamari';

const insertTextAtPosition = (text: string, pos: CaretPosition): Option<CaretPosition> => {
  const container = pos.container();
  const offset = pos.offset();

  if (NodeType.isText(container)) {
    container.insertData(offset, text);
    return Option.some(CaretPosition(container, offset + text.length));
  } else {
    return getElementFromPosition(pos).map((elm) => {
      const textNode = Element.fromText(text);

      if (pos.isAtEnd()) {
        Insert.after(elm, textNode);
      } else {
        Insert.before(elm, textNode);
      }

      return CaretPosition(textNode.dom(), text.length);
    });
  }
};

const insertNbspAtPosition = Fun.curry2(insertTextAtPosition, Unicode.nbsp);
const insertSpaceAtPosition = Fun.curry2(insertTextAtPosition, ' ');

export {
  insertTextAtPosition,
  insertNbspAtPosition,
  insertSpaceAtPosition
};
