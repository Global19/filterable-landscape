import React from 'react';
import Icon from 'material-ui/Icon';
import millify from 'millify'
import classNames from 'classnames'
import Subheader from 'material-ui/List/ListSubheader';
import _ from 'lodash';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { NavLink } from 'react-router-dom';

const cardWidth = 200;
const itemsCache = {};

const renderCard = function({item, onSelectItem, isVisible}) {
  if (isVisible) {
    return   (<div className="mosaic-wrap">
      <div className={classNames('mosaic',{inception : item.cncfRelation ==='inception'},
        {incubating : item.cncfRelation ==='incubating'},
        {graduated : item.cncfRelation ==='graduated'},
        {nonoss : item.oss === false})}
        key={item.id} onClick={() => onSelectItem(item.id)} >
        <div className="logo_wrapper">
          <img src={item.href} className='logo' max-height='100%' max-width='100%' />
        </div>
        <div className="mosaic-info">
          <div>
            <h5>{item.name}</h5>
            {item.organization}
          </div>
          <div className="mosaic-stars">
            { _.isNumber(item.stars) &&
                <div>
                  <Icon color="disabled" style={{ fontSize: 15 }}>star</Icon>
                  <span>{item.starsAsText}</span>
                </div>
            }
            { Number.isInteger(item.amount) &&
                <div className="mosaic-funding">{item.amountKind === 'funding' ? 'Funding: ': 'MCap: '} {'$'+ millify( item.amount )}</div>
            }
          </div>
        </div>
      </div>
    </div>);
  }
    else {
      return   (<div className="mosaic-wrap">
        <div className='mosaic' key={item.id} >
          <div className="logo_wrapper">
          </div>
          <div className="mosaic-info">
            <div>
              <h5>{item.name}</h5>
              {item.organization}
            </div>
          </div>
        </div>
      </div>);
    }
};

const MainContent = ({groupedItems, onSelectItem}) => {
  const getItems = function(width) {
    if (itemsCache.width === width && itemsCache.groupedItems === groupedItems) {
      return itemsCache.result;
    }
    const cardsPerRow = Math.floor(width / cardWidth);
    const rows = _.map(groupedItems, function(groupedItem) {
      return [{
        type: 'header',
        href: groupedItem.href,
        header: groupedItem.header,
        count: groupedItem.items.length
      }].concat(_.chunk(groupedItem.items, cardsPerRow).map(function(itemsInRow) {
        return {
          type: 'row',
          items: itemsInRow
        };
      }));
    });
    const result = _.flatten(rows).concat({type: 'space'});
    _.assign(itemsCache, {
      width,
      groupedItems,
      result
    });
    return result;
  };
  const getEstimatedRowSize = function(width) {
    const items = getItems(width);
    if (items.length === 0) {
      return 30;
    }
    const totalHeight = _.sum(_.map(items, (_item, index) => getRowHeight(width)({index})));
    return totalHeight / items.length;

  }
  const rowRenderer = function(width) {
    return ({index, isVisible, key, style}) => {
      const items = getItems(width);
      const row = items[index];
      const element = do {
        if (row.type === 'header') {
          <div className="sh_wrapper" key={key} style={style}>
            <Subheader component="div" style={{fontSize: 24}}>
              { row.href ?  <NavLink  to={row.href}>{row.header}</NavLink> : <span>{row.header}</span> }
              <span>({row.count})</span>
            </Subheader>
          </div>
        } else if (row.type === 'row') {
          <div className="cards-row" key={key} style={style}>
            {row.items.map( (item) => (
              renderCard({item, onSelectItem, isVisible})

            ))}
          </div>
        } else if (row.type === 'space') {
          <div style={{height: 20}}/>
        } else {
          throw new Error('Unkown row type in' + row);
        }
      };
      // const className = cn(styles.row, {
      // [styles.rowScrolling]: isScrolling,
      // isVisible: isVisible,
      // });

      return element ;
    };
  };
  const getRowHeight = function(width) {
    return function({index}) {
      const items = getItems(width);
      const row = items[index];
      if (row.type === 'header') {
        return 50;
      }
      if (row.type === 'row') {
        return 210;
      }
      if (row.type === 'space') {
        return 20;
      }
      throw new Error('Wrong type', row.type);
    }
  };
  return (
    <WindowScroller
      scrollElement={window}>
      {({height, isScrolling, registerChild, onChildScroll, scrollTop}) => (
            <div>
              <AutoSizer disableHeight>
                {({width}) => (
                  <div ref={registerChild}>
                    <List
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      overscanRowCount={ width < 760 ? 2: 20000}
                      rowCount={getItems(width).length}
                      rowHeight={getRowHeight(width)}
                      estimatedRowSize={getEstimatedRowSize(width)}
                      rowRenderer={rowRenderer(width)}
                      scrollTop={scrollTop}
                      width={width}
                    />
                  </div>
                )}
              </AutoSizer>
            </div>
          )}
        </WindowScroller>
  );
};

export default MainContent;
