import { ChildNode, Document, HTMLElement, Node as DomNode, ParentNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import * as Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as Node from '../node/Node';
import * as ElementParams from '../../impl/ElementParams';

/**
 * The document associated with the current element
 * NOTE: this will throw if the owner is null.
 */
const owner = (element: Element<DomNode>) => Element.fromDom(element.dom().ownerDocument);

/**
 * If the element is a document, return it. Otherwise, return its ownerDocument.
 * @param dos
 */
const documentOrOwner = (dos: Element<DomNode>): Element<Document> =>
  Node.isDocument(dos) ? dos : owner(dos);

const getOwnerDocumentOrThrow = (element: Element<DomNode>): Document => {
  const od = element.dom().ownerDocument;
  if (Type.isNonNullable(od)) {
    return od;
  } else {
    throw new Error('ownerDocument was not set');
  }
};

const documentElement = (element: Element<DomNode>) =>
  Element.fromDom(getOwnerDocumentOrThrow(element).documentElement);

// The window element associated with the element
const defaultView = (element: Element<DomNode>) =>
  Element.fromDom(getOwnerDocumentOrThrow(element).defaultView);

const parent = (element: Element<DomNode>): Option<Element<DomNode & ParentNode>> =>
  Option.from(element.dom().parentNode).map(Element.fromDom);

/** Variant of #parent. This return type can be more convenient in some situations. */
const parentNode = (element: Element<DomNode>): Option<Element<DomNode>> =>
  parent(element).map(ElementParams.narrowL());

const findIndex = (element: Element<DomNode>) => parent(element).bind((p) => {
  // TODO: Refactor out children so we can avoid the constant unwrapping
  const kin = children(p);
  return Arr.findIndex(kin, (elem) => Compare.eq(element, elem));
});

const parents = (element: Element<DomNode>, isRoot?: (e: Element<DomNode>) => boolean) => {
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.never;

  // This is used a *lot* so it needs to be performant, not recursive
  let dom: DomNode = element.dom();
  const ret: Element<DomNode>[] = [];

  while (dom.parentNode !== null && dom.parentNode !== undefined) {
    const rawParent = dom.parentNode;
    const p = Element.fromDom(rawParent);
    ret.push(p);

    if (stop(p) === true) {
      break;
    } else {
      dom = rawParent;
    }
  }
  return ret;
};

const siblings = (element: Element<DomNode>) => {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = <E> (elements: Element<E>[]) => Arr.filter(elements, (x) => !Compare.eq(element, x));

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = (element: Element<HTMLElement>) =>
  Option.from(element.dom().offsetParent).map(Element.fromDom);

const prevSibling = (element: Element<DomNode>): Option<Element<DomNode & ChildNode>> =>
  Option.from(element.dom().previousSibling).map(Element.fromDom);

const nextSibling = (element: Element<DomNode>): Option<Element<DomNode & ChildNode>> =>
  Option.from(element.dom().nextSibling).map(Element.fromDom);

// This one needs to be reversed, so they're still in DOM order
const prevSiblings = (element: Element<DomNode>): Array<Element<DomNode & ChildNode>> =>
  Arr.reverse(Recurse.toArray(element as Element<DomNode & ChildNode>, prevSibling));

const nextSiblings = (element: Element<DomNode>): Array<Element<DomNode & ChildNode>> =>
  Recurse.toArray(element as Element<DomNode & ChildNode>, nextSibling);

const children = (element: Element<DomNode>): Array<Element<DomNode & ChildNode>> =>
  Arr.map(element.dom().childNodes, Element.fromDom);

const child = (element: Element<DomNode>, index: number): Option<Element<DomNode & ChildNode>> => {
  const cs = element.dom().childNodes;
  return Option.from(cs[index]).map(Element.fromDom);
};

const firstChild = (element: Element<DomNode>): Option<Element<DomNode & ChildNode>> =>
  child(element, 0);

const lastChild = (element: Element<DomNode>): Option<Element<DomNode & ChildNode>> =>
  child(element, element.dom().childNodes.length - 1);

const childNodesCount = (element: Element<DomNode>): number =>
  element.dom().childNodes.length;

const hasChildNodes = (element: Element<DomNode>): boolean =>
  element.dom().hasChildNodes();

export interface ElementAndOffset<E> {
  readonly element: () => Element<E>;
  readonly offset: () => number;
}

const spot = <E>(element: Element<E>, offset: number): ElementAndOffset<E> => ({
  element: Fun.constant(element),
  offset: Fun.constant(offset)
});

const leaf = (element: Element<DomNode>, offset: number): ElementAndOffset<DomNode> => {
  const cs = children(element);
  return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
};

export {
  owner,
  documentOrOwner,
  defaultView,
  documentElement,
  parent,
  parentNode,
  findIndex,
  parents,
  siblings,
  prevSibling,
  offsetParent,
  prevSiblings,
  nextSibling,
  nextSiblings,
  children,
  child,
  firstChild,
  lastChild,
  childNodesCount,
  hasChildNodes,
  leaf
};
