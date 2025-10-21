// controllers/genericController.js

// --- LEER TODOS los registros de un modelo ---
exports.getAll = (Model) => async (req, res) => {
  try {
    const records = await Model.findAll();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor', error: error.message });
  }
};

// --- CREAR un nuevo registro ---
exports.createOne = (Model) => async (req, res) => {
  try {
    const newRecord = await Model.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ msg: 'Error al crear el registro', error: error.message });
  }
};

// --- OBTENER un registro por ID ---
exports.getOne = (Model) => async (req, res) => {
    try {
        const record = await Model.findByPk(req.params.id);
        if (!record) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};


// --- ACTUALIZAR un registro por ID ---
exports.updateOne = (Model) => async (req, res) => {
  try {
    const [updated] = await Model.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ msg: 'Registro no encontrado' });
    }
    const updatedRecord = await Model.findByPk(req.params.id);
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ msg: 'Error al actualizar', error: error.message });
  }
};

// --- BORRAR un registro por ID ---
exports.deleteOne = (Model) => async (req, res) => {
  try {
    const deleted = await Model.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ msg: 'Registro no encontrado' });
    }
    res.status(204).send(); // 204 No Content: éxito, sin nada que devolver
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar', error: error.message });
  }
};