import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Head from 'ephox/sugar/api/node/Head';
import Element from 'ephox/sugar/api/node/Element';
import { Testable } from '@ephox/dispute';
import { document } from '@ephox/dom-globals';
import { withIframe } from 'ephox/sugar/test/WithHelpers';

UnitTest.test('head in normal document', () => {
  Assert.eq('head should be head', document.head, Head.getHead(Element.fromDom(document)).dom(), Testable.tStrict);
});

UnitTest.test('head in iframe', () => {
  withIframe((div, iframe, cw) => {
    Assert.eq('head should be iframe head', cw.document.head, Head.getHead(Element.fromDom(cw.document)).dom(), Testable.tStrict);
  });
});
