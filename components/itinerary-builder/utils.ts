const handleNumericInput = (value: string, field: 'duration' | 'price' | 'rating') => {
  const num = value === '' ? 0 : Number(value);
  if (!isNaN(num)) {
    setEditedEvent({ ...editedEvent, [field]: num });
  }
};
