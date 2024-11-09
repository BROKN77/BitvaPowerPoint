import React, { useState, useRef, useEffect } from 'react';
import './App.css'; // Импортируем стили

const App = () => {
  const [circles, setCircles] = useState([]); // Хранит массив кругов
  const [selectedCircleIds, setSelectedCircleIds] = useState(new Set()); // Хранит ID выделенных кругов
  const slideRef = useRef(null); // Ссылка на область слайда
  const isDragging = useRef(false); // Флаг для отслеживания перетаскивания
  const dragOffset = useRef({ x: 0, y: 0 }); // Смещение для перетаскивания

  // Функция для добавления нового круга в область слайда
  const addCircle = () => {
    const slide = slideRef.current;
    const size = Math.random() * (0.2 * slide.clientWidth - 0.05 * slide.clientWidth) + 0.05 * slide.clientWidth; // Размер от 5% до 20% от ширины слайда
    const newCircle = {
      id: Date.now(), // Генерируем уникальный ID для нового круга
      size,
      x: Math.random() * (slide.clientWidth - size), // Определяем случайную позицию по X с учетом размера круга
      y: Math.random() * (slide.clientHeight - size), // Определяем случайную позицию по Y с учетом размера круга
    };
    setCircles([...circles, newCircle]); // Добавляем новый круг в состояние
  };

  // Функция для удаления выделенных кругов из состояния
  const deleteSelectedCircles = () => {
    setCircles(circles.filter(circle => !selectedCircleIds.has(circle.id))); // Удаляем выделенные круги
    setSelectedCircleIds(new Set()); // Очищаем выделенные круги после удаления
  };

  // Обработчик нажатия клавиш, позволяет удалять выделенные круги при нажатии Backspace
  const handleKeyDown = (event) => {
    if (event.key === 'Backspace') {
      deleteSelectedCircles(); // Удаляем выделенные круги при нажатии Backspace
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown); // Добавляем обработчик нажатий клавиш
    return () => {
      window.removeEventListener('keydown', handleKeyDown); // Убираем обработчик при размонтировании компонента
    };
  }, [selectedCircleIds]); // Зависимость от выделенных кругов

  // Функция для обработки клика по кругу, добавляет или убирает выделение
  const handleCircleClick = (circle) => {
    setSelectedCircleIds(prev => {
      const newSelectedIds = new Set(prev);
      if (newSelectedIds.has(circle.id)) {
        newSelectedIds.delete(circle.id); // Убираем круг из выделенных, если он уже выделен
      } else {
        newSelectedIds.add(circle.id); // Добавляем круг в выделенные
      }
      return newSelectedIds;
    });
  };

  // Функция для обработки перетаскивания кругов
  const handleMouseDown = (e) => {
    isDragging.current = true; // Устанавливаем флаг перетаскивания в true
    const slide = slideRef.current;
    dragOffset.current.x = e.clientX - e.target.getBoundingClientRect().left;
    dragOffset.current.y = e.clientY - e.target.getBoundingClientRect().top;

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const selectedCircles = circles.filter(circle => selectedCircleIds.has(circle.id));
      setCircles(prevCircles =>
        prevCircles.map(circle => {
          if (selectedCircleIds.has(circle.id)) {
            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            return {
              ...circle,
              x: Math.max(0, Math.min(newX, slide.clientWidth - circle.size)), // Ограничиваем движение по X
              y: Math.max(0, Math.min(newY, slide.clientHeight - circle.size)), // Ограничиваем движение по Y
            };
          }
          return circle;
        })
      );
    };

    const handleMouseUp = () => {
      isDragging.current = false; // Устанавливаем флаг перетаскивания в false
      document.removeEventListener('mousemove', handleMouseMove);      
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className='bodyOn'>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button className='button-circle' onClick={addCircle}>Добавить круг</button>
        <div ref={slideRef} className="slide" onMouseDown={handleMouseDown}>
          {circles.map(circle => (
            <div
              key={circle.id}
              className={`circle ${selectedCircleIds.has(circle.id) ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                borderRadius: '50%',
                backgroundColor: 'lightskyblue',
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                cursor: 'pointer',
              }}
              onClick={() => handleCircleClick(circle)} // Обработчик клика по кругу
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
