package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperEntity;

public interface NewsPaperRepo
        extends JpaRepository<NewspaperEntity, Long> {

    List<NewspaperEntity> findByDistributorMobile(
            String mobile
    );

    List<NewspaperEntity> findByLanguage(String language);

    List<NewspaperEntity> findByPublisher(String publisher);
}