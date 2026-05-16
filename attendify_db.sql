-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 16 mai 2026 à 13:41
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `attendify_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `pointages`
--

CREATE TABLE `pointages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rfid_card` varchar(50) NOT NULL,
  `date_point` date NOT NULL,
  `heure` time NOT NULL,
  `statut` enum('present','retard','absent') NOT NULL DEFAULT 'present',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pointages`
--

INSERT INTO `pointages` (`id`, `user_id`, `rfid_card`, `date_point`, `heure`, `statut`, `note`, `created_at`) VALUES
(1, 4, 'A3F2', '2026-05-15', '08:02:00', 'present', NULL, '2026-05-15 11:22:44'),
(2, 4, 'A3F2', '2026-05-14', '08:33:00', 'retard', NULL, '2026-05-15 11:22:44'),
(3, 4, 'A3F2', '2026-05-13', '07:58:00', 'present', NULL, '2026-05-15 11:22:44'),
(4, 5, 'B1C4', '2026-05-15', '07:55:00', 'present', NULL, '2026-05-15 11:22:44'),
(5, 5, 'B1C4', '2026-05-14', '08:45:00', 'retard', NULL, '2026-05-15 11:22:44');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBvZnBwdC5tYSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdGV1ciIsImlhdCI6MTc3ODg4MDM0MCwiZXhwIjoxNzc4OTY2NzQwfQ.7h58wyonRapsRP6lI0VqbGpF3bvEdHLERFlJ1WBuRJ0', '2026-05-16 22:25:40', '2026-05-15 21:25:40');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rfid_card` varchar(50) DEFAULT NULL,
  `role` enum('admin','formateur','stagiaire') NOT NULL DEFAULT 'stagiaire',
  `groupe` varchar(50) DEFAULT NULL,
  `annee` varchar(20) DEFAULT NULL,
  `status` enum('actif','inactif') DEFAULT 'actif',
  `avatar` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `rfid_card`, `role`, `groupe`, `annee`, `status`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'Administrateur', 'admin@ofppt.ma', '$20y$10$', NULL, 'admin', NULL, NULL, 'actif', 'AD', '2026-05-15 11:22:44', '2026-05-15 11:22:44'),
(2, 'Mohammed Alaoui', 'm.alaoui@ofppt.ma', '$1y$10$', 'F001', 'formateur', 'DEV101', NULL, 'actif', 'MA', '2026-05-15 11:22:44', '2026-05-15 11:22:44'),
(3, 'Fatima Zohra', 'f.zohra@ofppt.ma', '$2y$10$', 'F002', 'formateur', 'INF202', NULL, 'actif', 'FZ', '2026-05-15 11:22:44', '2026-05-15 11:22:44'),
(4, 'Ahmed Benali', 'ahmed.benali@ofppt.ma', '$2y$1$', 'A3F2', 'stagiaire', 'DEV101', '2ème année', 'actif', 'AB', '2026-05-15 11:22:44', '2026-05-15 11:22:44'),
(5, 'Sara Idrissi', 'sara.idrissi@ofppt.ma', '$2y$2$', 'B1C4', 'stagiaire', 'DEV101', '2ème année', 'actif', 'SI', '2026-05-15 11:22:44', '2026-05-15 11:22:44'),
(6, 'Youssef Karimi', 'y.karimi@ofppt.ma', '$2y$3$', 'C9D1', 'stagiaire', 'INF202', '1ère année', 'actif', 'YK', '2026-05-15 11:22:44', '2026-05-15 11:22:44');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `pointages`
--
ALTER TABLE `pointages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pointage_jour` (`user_id`,`date_point`),
  ADD KEY `idx_pointages_date` (`date_point`),
  ADD KEY `idx_pointages_user` (`user_id`),
  ADD KEY `idx_pointages_statut` (`statut`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `rfid_card` (`rfid_card`),
  ADD KEY `idx_users_rfid` (`rfid_card`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `pointages`
--
ALTER TABLE `pointages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `pointages`
--
ALTER TABLE `pointages`
  ADD CONSTRAINT `pointages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
